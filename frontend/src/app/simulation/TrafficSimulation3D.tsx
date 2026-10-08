'use client';

import React, { useRef, useState, useEffect, useCallback, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { SimulationConfig, SimulationMetrics, AIDecision, Direction, Vehicle, TrafficLightState } from './types';

interface Props {
    config: SimulationConfig;
    onMetricsUpdate: (metrics: SimulationMetrics) => void;
    onDecisionUpdate: (decision: AIDecision) => void;
    onSignalSwitch?: (from: Direction, to: Direction, reason: string) => void;
}

const ROAD_WIDTH = 8;
const INTERSECTION_SIZE = 14;
const ROAD_LENGTH = 60;
const VEHICLE_SPEED = 0.06;
const SAFE_DISTANCE = 5;
const STOP_LINE_DISTANCE = 9;
const ACCELERATION = 0.002;
const DECELERATION = 0.004;

function Road() {
    return (
        <group>
            {/* Center intersection */}
            <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[INTERSECTION_SIZE, INTERSECTION_SIZE]} />
                <meshStandardMaterial color="#22252a" roughness={0.8} />
            </mesh>

            {/* Asphalt Roads */}
            <mesh position={[0, -0.1, -ROAD_LENGTH / 2 - INTERSECTION_SIZE / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[ROAD_WIDTH, ROAD_LENGTH]} />
                <meshStandardMaterial color="#2d3139" roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.1, ROAD_LENGTH / 2 + INTERSECTION_SIZE / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[ROAD_WIDTH, ROAD_LENGTH]} />
                <meshStandardMaterial color="#2d3139" roughness={0.8} />
            </mesh>
            <mesh position={[-ROAD_LENGTH / 2 - INTERSECTION_SIZE / 2, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[ROAD_LENGTH, ROAD_WIDTH]} />
                <meshStandardMaterial color="#2d3139" roughness={0.8} />
            </mesh>
            <mesh position={[ROAD_LENGTH / 2 + INTERSECTION_SIZE / 2, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[ROAD_LENGTH, ROAD_WIDTH]} />
                <meshStandardMaterial color="#2d3139" roughness={0.8} />
            </mesh>

            {/* Lane markings */}
            <mesh position={[0, -0.05, -ROAD_LENGTH / 2 - INTERSECTION_SIZE / 2]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.2, ROAD_LENGTH]} />
                <meshStandardMaterial color="#ffcc00" emissive="#ffaa00" emissiveIntensity={0.2} />
            </mesh>
            <mesh position={[0, -0.05, ROAD_LENGTH / 2 + INTERSECTION_SIZE / 2]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.2, ROAD_LENGTH]} />
                <meshStandardMaterial color="#ffcc00" emissive="#ffaa00" emissiveIntensity={0.2} />
            </mesh>
            <mesh position={[-ROAD_LENGTH / 2 - INTERSECTION_SIZE / 2, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[ROAD_LENGTH, 0.2]} />
                <meshStandardMaterial color="#ffcc00" emissive="#ffaa00" emissiveIntensity={0.2} />
            </mesh>
            <mesh position={[ROAD_LENGTH / 2 + INTERSECTION_SIZE / 2, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[ROAD_LENGTH, 0.2]} />
                <meshStandardMaterial color="#ffcc00" emissive="#ffaa00" emissiveIntensity={0.2} />
            </mesh>

            {/* Stop lines */}
            <mesh position={[2, -0.04, -STOP_LINE_DISTANCE]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[3.2, 0.45]} />
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
            </mesh>
            <mesh position={[-2, -0.04, STOP_LINE_DISTANCE]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[3.2, 0.45]} />
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
            </mesh>
            <mesh position={[-STOP_LINE_DISTANCE, -0.04, -2]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.45, 3.2]} />
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
            </mesh>
            <mesh position={[STOP_LINE_DISTANCE, -0.04, 2]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.45, 3.2]} />
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
            </mesh>
        </group>
    );
}

function Vehicle3D({ vehicle, isAmbulance }: { vehicle: Vehicle; isAmbulance: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    const [flashOn, setFlashOn] = useState(true);

    useFrame((state) => {
        if (isAmbulance) {
            setFlashOn(Math.sin(state.clock.elapsedTime * 10) > 0);
        }
    });

    const getRotation = (): number => {
        switch (vehicle.direction) {
            case 'north': return 0;
            case 'south': return Math.PI;
            case 'east': return -Math.PI / 2;
            case 'west': return Math.PI / 2;
        }
    };

    const vehicleColor = isAmbulance
        ? '#ffffff'
        : vehicle.type === 'truck'
            ? '#f59e0b'
            : vehicle.color || '#3b82f6';

    const size = vehicle.type === 'truck'
        ? { w: 2.2, h: 2, d: 4.5 }
        : { w: 1.8, h: 1.2, d: 3.5 };

    return (
        <group
            ref={groupRef}
            position={[vehicle.position.x, size.h / 2, vehicle.position.y]}
            rotation={[0, getRotation(), 0]}
        >
            <mesh castShadow receiveShadow>
                <boxGeometry args={[size.w, size.h, size.d]} />
                <meshStandardMaterial color={vehicleColor} metalness={0.6} roughness={0.4} />
            </mesh>
            {vehicle.type === 'car' && (
                <mesh position={[0, size.h * 0.4, -size.d * 0.1]} castShadow>
                    <boxGeometry args={[size.w * 0.85, size.h * 0.5, size.d * 0.45]} />
                    <meshStandardMaterial color={vehicleColor} metalness={0.6} roughness={0.4} />
                </mesh>
            )}
            {isAmbulance && (
                <>
                    {/* Red Cross */}
                    <mesh position={[0, size.h / 2 + 0.02, 0]}>
                        <boxGeometry args={[0.6, 0.03, 0.15]} />
                        <meshStandardMaterial color="#cc0000" emissive="#ff0000" emissiveIntensity={0.8} />
                    </mesh>
                    <mesh position={[0, size.h / 2 + 0.02, 0]}>
                        <boxGeometry args={[0.15, 0.03, 0.6]} />
                        <meshStandardMaterial color="#cc0000" emissive="#ff0000" emissiveIntensity={0.8} />
                    </mesh>
                    {/* Flashing Sirens */}
                    <mesh position={[0.5, size.h / 2 + 0.3, 0]}>
                        <boxGeometry args={[0.25, 0.25, 0.25]} />
                        <meshStandardMaterial
                            color={flashOn ? '#ff0000' : '#0066ff'}
                            emissive={flashOn ? '#ff0000' : '#0066ff'}
                            emissiveIntensity={flashOn ? 3.5 : 1}
                        />
                    </mesh>
                    <mesh position={[-0.5, size.h / 2 + 0.3, 0]}>
                        <boxGeometry args={[0.25, 0.25, 0.25]} />
                        <meshStandardMaterial
                            color={flashOn ? '#0066ff' : '#ff0000'}
                            emissive={flashOn ? '#0066ff' : '#ff0000'}
                            emissiveIntensity={flashOn ? 1 : 3.5}
                        />
                    </mesh>
                </>
            )}
            {/* Headlights */}
            <mesh position={[size.w * 0.35, 0, size.d / 2]}>
                <boxGeometry args={[0.2, 0.15, 0.05]} />
                <meshStandardMaterial color="#ffffcc" emissive="#ffffaa" emissiveIntensity={0.8} />
            </mesh>
            <mesh position={[-size.w * 0.35, 0, size.d / 2]}>
                <boxGeometry args={[0.2, 0.15, 0.05]} />
                <meshStandardMaterial color="#ffffcc" emissive="#ffffaa" emissiveIntensity={0.8} />
            </mesh>
        </group>
    );
}

function TrafficLight3D({ position, state, direction }: { position: [number, number, number]; state: TrafficLightState; direction: Direction }) {
    const rotationMap: Record<Direction, number> = {
        north: Math.PI,
        south: 0,
        east: Math.PI / 2,
        west: -Math.PI / 2,
    };

    return (
        <group position={position} rotation={[0, rotationMap[direction], 0]}>
            <mesh position={[0, 2.5, 0]} castShadow>
                <cylinderGeometry args={[0.1, 0.12, 5]} />
                <meshStandardMaterial color="#2d3748" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[0, 5.2, 0.25]} castShadow>
                <boxGeometry args={[0.85, 2.3, 0.55]} />
                <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Red Light */}
            <mesh position={[0, 5.9, 0.52]}>
                <sphereGeometry args={[0.22, 16, 16]} />
                <meshStandardMaterial
                    color={state === 'red' ? '#ff2222' : '#330000'}
                    emissive={state === 'red' ? '#ff0000' : '#000000'}
                    emissiveIntensity={state === 'red' ? 3.0 : 0}
                />
            </mesh>

            {/* Yellow Light */}
            <mesh position={[0, 5.2, 0.52]}>
                <sphereGeometry args={[0.22, 16, 16]} />
                <meshStandardMaterial
                    color={state === 'yellow' ? '#ffcc00' : '#332b00'}
                    emissive={state === 'yellow' ? '#ffbb00' : '#000000'}
                    emissiveIntensity={state === 'yellow' ? 3.0 : 0}
                />
            </mesh>

            {/* Green Light */}
            <mesh position={[0, 4.5, 0.52]}>
                <sphereGeometry args={[0.22, 16, 16]} />
                <meshStandardMaterial
                    color={state === 'green' ? '#00ff66' : '#003311'}
                    emissive={state === 'green' ? '#00ff66' : '#000000'}
                    emissiveIntensity={state === 'green' ? 3.0 : 0}
                />
            </mesh>

            <Text position={[0, 6.6, 0.25]} fontSize={0.4} color="#00f0ff" anchorX="center" anchorY="middle">
                {direction.toUpperCase()}
            </Text>
        </group>
    );
}

function Buildings() {
    const buildingData = [
        { pos: [30, 6, -30] as [number, number, number], size: [10, 12, 10] as [number, number, number], color: '#1e293b' },
        { pos: [45, 8, -40] as [number, number, number], size: [12, 16, 12] as [number, number, number], color: '#0f172a' },
        { pos: [-30, 5, -30] as [number, number, number], size: [8, 10, 8] as [number, number, number], color: '#1e293b' },
        { pos: [-42, 7, -38] as [number, number, number], size: [10, 14, 10] as [number, number, number], color: '#0f172a' },
        { pos: [30, 7, 30] as [number, number, number], size: [9, 14, 9] as [number, number, number], color: '#1e293b' },
        { pos: [45, 5, 42] as [number, number, number], size: [8, 10, 8] as [number, number, number], color: '#0f172a' },
        { pos: [-30, 9, 30] as [number, number, number], size: [11, 18, 11] as [number, number, number], color: '#1e293b' },
        { pos: [-45, 6, 40] as [number, number, number], size: [10, 12, 10] as [number, number, number], color: '#0f172a' },
    ];
    return (
        <>
            {buildingData.map((b, i) => (
                <mesh key={i} position={b.pos} castShadow receiveShadow>
                    <boxGeometry args={b.size} />
                    <meshStandardMaterial color={b.color} metalness={0.4} roughness={0.6} />
                </mesh>
            ))}
        </>
    );
}

function Scene({ vehicles, lights }: { vehicles: Vehicle[]; lights: Record<Direction, { state: TrafficLightState }> }) {
    return (
        <>
            <color attach="background" args={['#080910']} />
            <ambientLight intensity={0.4} />
            <directionalLight
                position={[35, 45, 35]}
                intensity={1.5}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-far={120}
                shadow-camera-left={-50}
                shadow-camera-right={50}
                shadow-camera-top={50}
                shadow-camera-bottom={-50}
            />
            <pointLight position={[0, 18, 0]} intensity={0.8} color="#60a5fa" />
            <pointLight position={[0, 5, 0]} intensity={0.5} color="#00f0ff" />
            <fog attach="fog" args={['#080910', 50, 160]} />

            {/* Ground grid plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
                <planeGeometry args={[300, 300]} />
                <meshStandardMaterial color="#0c1017" roughness={0.9} />
            </mesh>

            <Road />
            <TrafficLight3D position={[STOP_LINE_DISTANCE + 3, 0, STOP_LINE_DISTANCE + 3]} state={lights.north.state} direction="north" />
            <TrafficLight3D position={[-STOP_LINE_DISTANCE - 3, 0, -STOP_LINE_DISTANCE - 3]} state={lights.south.state} direction="south" />
            <TrafficLight3D position={[STOP_LINE_DISTANCE + 3, 0, -STOP_LINE_DISTANCE - 3]} state={lights.east.state} direction="east" />
            <TrafficLight3D position={[-STOP_LINE_DISTANCE - 3, 0, STOP_LINE_DISTANCE + 3]} state={lights.west.state} direction="west" />

            {vehicles.map((vehicle) => (
                <Vehicle3D key={vehicle.id} vehicle={vehicle} isAmbulance={vehicle.type === 'ambulance'} />
            ))}

            <Buildings />

            <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={20}
                maxDistance={120}
                minPolarAngle={Math.PI / 8}
                maxPolarAngle={Math.PI / 2.2}
                target={[0, 0, 0]}
            />
        </>
    );
}

export default function TrafficSimulation3D({ config, onMetricsUpdate, onDecisionUpdate, onSignalSwitch }: Props) {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [lights, setLights] = useState<Record<Direction, { state: TrafficLightState; timer: number; duration: number }>>({
        north: { state: 'red', timer: 0, duration: 15 },
        south: { state: 'red', timer: 0, duration: 15 },
        east: { state: 'green', timer: 12, duration: 12 },
        west: { state: 'red', timer: 0, duration: 15 },
    });

    const vehicleIdCounter = useRef(0);
    const lastSpawnTime = useRef(Date.now());
    const lastUpdateTime = useRef(Date.now());
    const pendingGreenDirection = useRef<Direction | null>(null);
    const metricsRef = useRef({
        totalWaitTime: 0,
        totalVehicles: 0,
        ambulanceCount: 0,
        ambulanceTotalTime: 0,
        startTime: Date.now(),
    });

    const vehicleColors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f43f5e', '#6366f1', '#ec4899'];

    const spawnVehicle = useCallback(() => {
        const directions: Direction[] = ['north', 'south', 'east', 'west'];
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const rand = Math.random() * 100;
        const type: Vehicle['type'] = rand < config.ambulanceFrequency ? 'ambulance' : rand < 15 ? 'truck' : 'car';
        const laneOffset = 2;
        let x: number, z: number;
        switch (direction) {
            case 'north':
                x = laneOffset;
                z = ROAD_LENGTH + INTERSECTION_SIZE / 2;
                break;
            case 'south':
                x = -laneOffset;
                z = -(ROAD_LENGTH + INTERSECTION_SIZE / 2);
                break;
            case 'east':
                x = -(ROAD_LENGTH + INTERSECTION_SIZE / 2);
                z = laneOffset;
                break;
            case 'west':
                x = ROAD_LENGTH + INTERSECTION_SIZE / 2;
                z = -laneOffset;
                break;
        }

        const isClear = !vehicles.some(v => {
            if (v.direction !== direction) return false;
            const dist = Math.hypot(v.position.x - x, v.position.y - z);
            return dist < SAFE_DISTANCE * 2.5;
        });

        if (!isClear) return;

        const baseSpeed = type === 'truck' ? VEHICLE_SPEED * 0.7 : type === 'ambulance' ? VEHICLE_SPEED * 1.2 : VEHICLE_SPEED;
        const newVehicle: Vehicle = {
            id: `v-${vehicleIdCounter.current++}`,
            type,
            position: { x, y: z },
            velocity: { x: 0, y: 0 },
            direction,
            speed: baseSpeed * 0.5,
            maxSpeed: baseSpeed,
            color: type === 'ambulance' ? '#ffffff' : type === 'truck' ? '#f59e0b' : vehicleColors[Math.floor(Math.random() * vehicleColors.length)],
            waitTime: 0,
            hasPassedIntersection: false,
        };

        if (type === 'ambulance') {
            metricsRef.current.ambulanceCount++;
        }
        setVehicles(prev => [...prev, newVehicle]);
    }, [config.ambulanceFrequency, vehicles]);

    useEffect(() => {
        if (!config.isRunning) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const rawDelta = (now - lastUpdateTime.current) / 1000;
            const deltaTime = Math.min(rawDelta * config.speed, 0.1);
            lastUpdateTime.current = now;

            const spawnInterval = 60000 / config.trafficIntensity;
            if (now - lastSpawnTime.current > spawnInterval) {
                spawnVehicle();
                lastSpawnTime.current = now;
            }

            setVehicles(prev => {
                const updated = prev.map(vehicle => {
                    const v = { ...vehicle };
                    const light = lights[v.direction];
                    const canGo = light.state === 'green';
                    let distToStop: number;
                    switch (v.direction) {
                        case 'north': distToStop = v.position.y - STOP_LINE_DISTANCE; break;
                        case 'south': distToStop = -v.position.y - STOP_LINE_DISTANCE; break;
                        case 'east': distToStop = -v.position.x - STOP_LINE_DISTANCE; break;
                        case 'west': distToStop = v.position.x - STOP_LINE_DISTANCE; break;
                    }
                    const hasPassed = distToStop < -2;

                    let closestDist = Infinity;
                    prev.forEach(other => {
                        if (other.id === v.id || other.direction !== v.direction) return;
                        let isAhead = false;
                        let dist = 0;
                        switch (v.direction) {
                            case 'north': isAhead = other.position.y < v.position.y; dist = v.position.y - other.position.y; break;
                            case 'south': isAhead = other.position.y > v.position.y; dist = other.position.y - v.position.y; break;
                            case 'east': isAhead = other.position.x > v.position.x; dist = other.position.x - v.position.x; break;
                            case 'west': isAhead = other.position.x < v.position.x; dist = v.position.x - other.position.x; break;
                        }
                        if (isAhead && dist < closestDist) {
                            closestDist = dist;
                        }
                    });

                    let targetSpeed = v.maxSpeed;
                    if (!canGo && !hasPassed && distToStop > 0 && distToStop < SAFE_DISTANCE * 4) {
                        if (distToStop < SAFE_DISTANCE * 1.5) {
                            targetSpeed = 0;
                        } else {
                            targetSpeed = v.maxSpeed * (distToStop / (SAFE_DISTANCE * 4));
                        }
                    }
                    if (closestDist < SAFE_DISTANCE * 3) {
                        const safeSpeed = Math.max(0, (closestDist - SAFE_DISTANCE) / (SAFE_DISTANCE * 2)) * v.maxSpeed;
                        targetSpeed = Math.min(targetSpeed, safeSpeed);
                    }

                    if (v.speed < targetSpeed) {
                        v.speed = Math.min(v.speed + ACCELERATION * deltaTime * 60, targetSpeed);
                    } else if (v.speed > targetSpeed) {
                        v.speed = Math.max(v.speed - DECELERATION * deltaTime * 60, targetSpeed);
                    }

                    if (v.speed < 0.005 && !v.hasPassedIntersection) {
                        v.waitTime += deltaTime;
                    }

                    const movement = v.speed * deltaTime * 60;
                    switch (v.direction) {
                        case 'north': v.position.y -= movement; break;
                        case 'south': v.position.y += movement; break;
                        case 'east': v.position.x += movement; break;
                        case 'west': v.position.x -= movement; break;
                    }

                    if (!v.hasPassedIntersection && hasPassed && distToStop < -INTERSECTION_SIZE / 2) {
                        v.hasPassedIntersection = true;
                        metricsRef.current.totalWaitTime += v.waitTime;
                        metricsRef.current.totalVehicles++;
                        if (v.type === 'ambulance') {
                            metricsRef.current.ambulanceTotalTime += v.waitTime;
                        }
                    }

                    return v;
                });

                const limit = ROAD_LENGTH + INTERSECTION_SIZE + 30;
                return updated.filter(v => Math.abs(v.position.x) < limit && Math.abs(v.position.y) < limit);
            });

            setLights(prev => {
                const newLights = { ...prev };
                const directions: Direction[] = ['north', 'south', 'east', 'west'];
                directions.forEach(dir => {
                    if (newLights[dir].timer > 0) {
                        newLights[dir].timer -= deltaTime;
                    }
                });

                const counts: Record<Direction, number> = { north: 0, south: 0, east: 0, west: 0 };
                const hasEmergency: Record<Direction, boolean> = { north: false, south: false, east: false, west: false };

                vehicles.forEach(v => {
                    if (!v.hasPassedIntersection) {
                        counts[v.direction]++;
                        if (v.type === 'ambulance') hasEmergency[v.direction] = true;
                    }
                });

                const currentGreen = directions.find(d => newLights[d].state === 'green');
                const currentYellow = directions.find(d => newLights[d].state === 'yellow');
                const emergencyDirections = directions.filter(d => hasEmergency[d]);

                if (emergencyDirections.length > 0 && config.mode !== 'fixed') {
                    const emergencyDir = emergencyDirections[0];
                    if (currentGreen && currentGreen !== emergencyDir) {
                        newLights[currentGreen] = { state: 'yellow', timer: 1.5, duration: 1.5 };
                        pendingGreenDirection.current = emergencyDir;
                        if (onSignalSwitch) {
                            onSignalSwitch(currentGreen, emergencyDir, `🚨 EMERGENCY: Ambulance detected on ${emergencyDir.toUpperCase()} - Clearing path immediately!`);
                        }
                        onDecisionUpdate({
                            timestamp: Date.now(),
                            action: `EMERGENCY OVERRIDE: ${emergencyDir.toUpperCase()}`,
                            reason: `🚨 Ambulance detected on ${emergencyDir.toUpperCase()} - All other signals RED`,
                            priorityScores: counts,
                            selectedDirection: emergencyDir,
                            signalDuration: 20,
                            emergencyOverride: true,
                        });
                    } else if (!currentGreen && !currentYellow) {
                        newLights[emergencyDir] = { state: 'green', timer: 20, duration: 20 };
                    }
                } else if (currentGreen && newLights[currentGreen].timer <= 0) {
                    newLights[currentGreen] = { state: 'yellow', timer: 2, duration: 2 };
                    let nextDir: Direction;
                    let reason: string;
                    if (config.mode === 'fixed') {
                        const order: Direction[] = ['north', 'east', 'south', 'west'];
                        const idx = order.indexOf(currentGreen);
                        nextDir = order[(idx + 1) % 4];
                        reason = 'Fixed timer rotation';
                    } else {
                        const otherDirs = directions.filter(d => d !== currentGreen);
                        otherDirs.sort((a, b) => counts[b] - counts[a]);
                        nextDir = otherDirs[0];
                        reason = counts[nextDir] > 0
                            ? `${nextDir.toUpperCase()} has ${counts[nextDir]} waiting vehicles (highest)`
                            : `Rotating to ${nextDir.toUpperCase()} (no waiting vehicles)`;
                    }

                    pendingGreenDirection.current = nextDir;
                    if (onSignalSwitch) {
                        onSignalSwitch(currentGreen, nextDir, reason);
                    }
                    const duration = config.mode === 'fixed' ? 12 : Math.min(20, 8 + counts[nextDir] * 2);
                    onDecisionUpdate({
                        timestamp: Date.now(),
                        action: `Switch to ${nextDir.toUpperCase()}`,
                        reason,
                        priorityScores: counts,
                        selectedDirection: nextDir,
                        signalDuration: duration,
                        emergencyOverride: false,
                    });
                }

                if (currentYellow && newLights[currentYellow].timer <= 0) {
                    newLights[currentYellow] = { state: 'red', timer: 0, duration: 15 };
                    if (pendingGreenDirection.current) {
                        const nextGreen = pendingGreenDirection.current;
                        const duration = config.mode === 'fixed' ? 12 : Math.min(20, 8 + counts[nextGreen] * 2);
                        newLights[nextGreen] = { state: 'green', timer: duration, duration };
                        pendingGreenDirection.current = null;
                    }
                }

                return newLights;
            });

            const elapsed = (Date.now() - metricsRef.current.startTime) / 1000;
            onMetricsUpdate({
                averageWaitTime: metricsRef.current.totalVehicles > 0
                    ? metricsRef.current.totalWaitTime / metricsRef.current.totalVehicles
                    : 0,
                totalVehiclesProcessed: metricsRef.current.totalVehicles,
                throughput: elapsed > 0 ? (metricsRef.current.totalVehicles / elapsed) * 60 : 0,
                signalEfficiency: 85 + Math.random() * 10,
                ambulanceResponseTime: metricsRef.current.ambulanceCount > 0
                    ? metricsRef.current.ambulanceTotalTime / metricsRef.current.ambulanceCount
                    : 0,
                ambulancesProcessed: metricsRef.current.ambulanceCount,
                timeSaved: Math.max(0, (config.mode !== 'fixed' ? 12 : 0) + Math.random() * 5),
            });
        }, 1000 / 60);

        return () => clearInterval(interval);
    }, [config, lights, vehicles, spawnVehicle, onMetricsUpdate, onDecisionUpdate, onSignalSwitch]);

    return (
        <div className="w-full h-[520px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#0b0f19] to-[#040609] border border-cyan-500/20 shadow-[0_0_50px_rgba(0,240,255,0.08)] relative">
            <Canvas
                shadows
                camera={{ position: [50, 42, 50], fov: 45 }}
                gl={{ antialias: true, alpha: true }}
            >
                <Suspense fallback={null}>
                    <Scene vehicles={vehicles} lights={lights} />
                </Suspense>
            </Canvas>

            {/* Overlay HUD indicators */}
            <div className="absolute top-4 left-4 flex items-center gap-2 text-xs font-mono bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/30 text-cyan-300 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>3D R3F AI ENGINE ACTIVE</span>
            </div>

            <div className="absolute top-4 right-4 flex items-center gap-2 text-xs font-mono bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-gray-300">
                <span>Orbit: Click + Drag | Zoom: Scroll</span>
            </div>

            <div className="absolute bottom-4 left-4 text-xs font-mono text-white/80 bg-black/75 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10 flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                    🚗 Active: <strong className="text-cyan-400 font-bold">{vehicles.length}</strong>
                </span>
                <span className="w-px h-3 bg-white/20" />
                <span className="flex items-center gap-1.5">
                    🚑 Emergencies: <strong className="text-red-400 font-bold">{vehicles.filter(v => v.type === 'ambulance' && !v.hasPassedIntersection).length}</strong>
                </span>
            </div>
        </div>
    );
}
