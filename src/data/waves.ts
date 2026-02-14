export interface WaveSpawn {
  enemyType: string;
  count: number;
  interval: number;
  xRange: [number, number];
  isBoss?: 'mid' | 'final';
}

export interface WaveDef {
  spawns: WaveSpawn[];
  delayAfter: number;
}

export const WAVES: WaveDef[] = [
  { spawns: [{ enemyType: 'diamond', count: 4, interval: 800, xRange: [60, 420] }], delayAfter: 3000 },
  { spawns: [{ enemyType: 'diamond', count: 6, interval: 600, xRange: [60, 420] }], delayAfter: 3000 },
  { spawns: [
    { enemyType: 'diamond', count: 4, interval: 700, xRange: [60, 240] },
    { enemyType: 'hexagon', count: 2, interval: 1200, xRange: [240, 420] },
  ], delayAfter: 4000 },
  { spawns: [
    { enemyType: 'square', count: 4, interval: 800, xRange: [60, 420] },
    { enemyType: 'diamond', count: 3, interval: 600, xRange: [60, 420] },
  ], delayAfter: 4000 },
  { spawns: [
    { enemyType: 'hexagon', count: 4, interval: 900, xRange: [80, 400] },
    { enemyType: 'square', count: 3, interval: 700, xRange: [80, 400] },
  ], delayAfter: 4000 },
  { spawns: [
    { enemyType: 'diamond', count: 8, interval: 400, xRange: [40, 440] },
    { enemyType: 'square', count: 4, interval: 800, xRange: [100, 380] },
  ], delayAfter: 5000 },
  { spawns: [{ enemyType: 'miniBoss', count: 1, interval: 0, xRange: [240, 240], isBoss: 'mid' }], delayAfter: 4000 },
  { spawns: [
    { enemyType: 'diamond', count: 6, interval: 500, xRange: [40, 440] },
    { enemyType: 'hexagon', count: 3, interval: 1000, xRange: [100, 380] },
    { enemyType: 'square', count: 3, interval: 800, xRange: [80, 400] },
  ], delayAfter: 5000 },
  { spawns: [
    { enemyType: 'square', count: 8, interval: 400, xRange: [40, 440] },
    { enemyType: 'hexagon', count: 4, interval: 800, xRange: [80, 400] },
  ], delayAfter: 5000 },
  { spawns: [
    { enemyType: 'diamond', count: 10, interval: 300, xRange: [40, 440] },
    { enemyType: 'hexagon', count: 4, interval: 700, xRange: [80, 400] },
    { enemyType: 'square', count: 5, interval: 600, xRange: [60, 420] },
  ], delayAfter: 6000 },
  { spawns: [{ enemyType: 'finalBoss', count: 1, interval: 0, xRange: [240, 240], isBoss: 'final' }], delayAfter: 0 },
];
