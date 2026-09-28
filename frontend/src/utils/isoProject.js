/**
 * Project-MELV :: Isometric & 2D Top-Down Projection Utilities
 * Unified mathematical projection engine for canvas digital twins.
 */

/**
 * Projects a 3D coordinate (x, y, z) into 2D isometric screen space.
 * @param {number} x - World X position
 * @param {number} y - World Y position
 * @param {number} z - World Z elevation (height above ground plane)
 * @param {number} width - Canvas viewport width
 * @param {number} height - Canvas viewport height
 * @param {number} [scaleFactor=220] - Denominator for scale normalization
 * @returns {{ x: number, y: number }} Screen coordinates
 */
export function projectIso(x, y, z = 0, width, height, scaleFactor = 220) {
  const cx = width / 2;
  const cy = height / 2;
  const cos30 = 0.8660254; // Math.cos(Math.PI / 6)
  const sin30 = 0.5;       // Math.sin(Math.PI / 6)
  const scale = Math.min(width, height) / scaleFactor;

  const screenX = cx + (x - y) * cos30 * scale;
  const screenY = cy + (x + y) * sin30 * scale * 0.65 - (z * scale * 0.9);
  return { x: screenX, y: screenY };
}

/**
 * Projects a 3D coordinate (x, y, z) into 2D orthographic top-down screen space.
 * @param {number} x - World X position
 * @param {number} y - World Y position
 * @param {number} z - World Z elevation
 * @param {number} width - Canvas viewport width
 * @param {number} height - Canvas viewport height
 * @param {number} [scaleFactor=210] - Denominator for scale normalization
 * @returns {{ x: number, y: number }} Screen coordinates
 */
export function projectTopDown(x, y, z = 0, width, height, scaleFactor = 210) {
  const cx = width / 2;
  const cy = height / 2;
  const scale = Math.min(width, height) / scaleFactor;
  return {
    x: cx + x * scale,
    y: cy + y * scale - (z ? z * 2 : 0)
  };
}

/**
 * Universal projection router supporting 'iso' and 'top' modes.
 */
export function projectPoint(mode, x, y, z, width, height, scaleFactor) {
  return mode === 'top'
    ? projectTopDown(x, y, z, width, height, scaleFactor)
    : projectIso(x, y, z, width, height, scaleFactor);
}

/**
 * Perspective corridor projection looking down an arterial multi-lane roadway.
 */
export function projectCorridor(mode, x, y, z = 0, width, height) {
  const cx = width / 2;
  const cy = height / 2;

  if (mode === 'iso') {
    const scale = Math.min(width, height) / 190;
    const sinA = 0.5587; // Math.sin(Math.PI / 5.2)
    const screenX = cx + (x * 1.35 - y * 0.45) * scale;
    const screenY = cy + (x * 0.35 + y * 0.85) * sinA * scale - (z * scale * 1.1);
    return { x: screenX, y: screenY };
  } else {
    const scale = Math.min(width, height) / 180;
    return {
      x: cx + x * scale * 1.4,
      y: cy + y * scale * 0.95 - (z ? z * 2 : 0)
    };
  }
}

