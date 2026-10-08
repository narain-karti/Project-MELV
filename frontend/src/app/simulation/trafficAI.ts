import type { Direction, TrafficMode, IntersectionState, AIDecision, Vehicle } from './types';

export function calculatePriorityScores(
    intersection: IntersectionState,
    vehicles: Vehicle[]
): Record<Direction, number> {
    const directions: Direction[] = ['north', 'south', 'east', 'west'];
    const scores: Record<Direction, number> = { north: 0, south: 0, east: 0, west: 0 };
    directions.forEach((direction) => {
        const queueScore = Math.min(intersection.queueLengths[direction] * 10, 100);
        const densityScore = Math.min(intersection.vehicleDensity[direction] * 5, 50);
        const emergencyBonus = intersection.emergencyPresent[direction] ? 200 : 0;
        const vehiclesInDirection = vehicles.filter(
            (v) => v.direction === direction && !v.hasPassedIntersection
        );
        const avgWaitTime = vehiclesInDirection.length > 0
            ? vehiclesInDirection.reduce((sum, v) => sum + v.waitTime, 0) / vehiclesInDirection.length
            : 0;
        const waitTimeScore = Math.min(avgWaitTime / 10, 50);
        scores[direction] = queueScore + densityScore + waitTimeScore + emergencyBonus;
    });
    return scores;
}

export function calculateGreenDuration(
    direction: Direction,
    intersection: IntersectionState,
    mode: TrafficMode
): number {
    if (mode === 'fixed') return 15;
    const queueLength = intersection.queueLengths[direction];
    const density = intersection.vehicleDensity[direction];
    const hasEmergency = intersection.emergencyPresent[direction];
    if (hasEmergency && mode === 'emergency') return 30;
    const baseDuration = 8;
    const queueBonus = Math.min(queueLength * 2, 12);
    const densityBonus = Math.min(density * 1, 5);
    return baseDuration + queueBonus + densityBonus;
}

export function makeTrafficDecision(
    intersection: IntersectionState,
    vehicles: Vehicle[],
    mode: TrafficMode,
    currentActiveDirection: Direction | null
): AIDecision {
    const scores = calculatePriorityScores(intersection, vehicles);
    const emergencyDirection = (['north', 'south', 'east', 'west'] as Direction[]).find(
        (dir) => intersection.emergencyPresent[dir]
    );
    let chosenDirection: Direction;
    let reasoning: string;
    let emergencyOverride = false;
    if (emergencyDirection && mode !== 'fixed') {
        chosenDirection = emergencyDirection;
        reasoning = `🚨 Emergency vehicle detected in ${emergencyDirection} direction. Clearing path immediately.`;
        emergencyOverride = true;
    } else if (mode === 'fixed') {
        const rotationOrder: Direction[] = ['north', 'south', 'east', 'west'];
        const currentIndex = currentActiveDirection ? rotationOrder.indexOf(currentActiveDirection) : -1;
        chosenDirection = rotationOrder[(currentIndex + 1) % 4];
        reasoning = `⏱️ Fixed timer rotation: ${chosenDirection} direction's turn.`;
    } else {
        chosenDirection = (Object.entries(scores) as [Direction, number][]).reduce((a, b) =>
            b[1] > a[1] ? b : a
        )[0];
        const topScore = scores[chosenDirection];
        const queueLen = intersection.queueLengths[chosenDirection];
        if (topScore < 20) {
            reasoning = `✅ Light traffic. Rotating to ${chosenDirection} direction.`;
        } else if (queueLen > 5) {
            reasoning = `🚗 High queue (${queueLen} vehicles) in ${chosenDirection}. Optimizing flow.`;
        } else {
            reasoning = `🧠 AI Priority: ${chosenDirection} direction (score: ${topScore.toFixed(0)})`;
        }
    }
    const greenDuration = calculateGreenDuration(chosenDirection, intersection, mode);
    return {
        timestamp: Date.now(),
        currentMode: mode,
        activeDirection: chosenDirection,
        reasoning,
        queueScores: scores,
        emergencyOverride,
        suggestedGreenDuration: greenDuration,
    };
}
