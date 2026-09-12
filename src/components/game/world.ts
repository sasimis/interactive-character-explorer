export type Obstacle = { x: number; z: number; r: number };

export const ARENA_RADIUS = 26;

export const TREES: { x: number; z: number; s: number }[] = [
  { x: -12, z: -8, s: 1.2 },
  { x: -18, z: 6, s: 0.9 },
  { x: 9, z: -15, s: 1.05 },
  { x: 17, z: -4, s: 1.3 },
  { x: 13, z: 12, s: 1 },
  { x: -6, z: 18, s: 1.15 },
  { x: -20, z: -14, s: 0.95 },
  { x: 2, z: -21, s: 1.1 },
];

export const ROCKS: { x: number; z: number; s: number }[] = [
  { x: -9, z: 9, s: 1 },
  { x: 6, z: 6, s: 0.7 },
  { x: 20, z: 9, s: 1.2 },
  { x: -15, z: -19, s: 0.8 },
];

export const CRATES: { x: number; z: number; r: number }[] = [
  { x: 4, z: -6, r: 0.4 },
  { x: 5.4, z: -7.1, r: -0.9 },
  { x: 4.6, z: -8.4, r: 1.7 },
  { x: -4, z: -3, r: 0.2 },
];

export const OBSTACLES: Obstacle[] = [
  ...TREES.map((t) => ({ x: t.x, z: t.z, r: 0.7 * t.s })),
  ...ROCKS.map((r) => ({ x: r.x, z: r.z, r: 1.1 * r.s })),
  ...CRATES.map((c) => ({ x: c.x, z: c.z, r: 0.75 })),
  { x: 0, z: 0, r: 2.4 }, // fountain
];
