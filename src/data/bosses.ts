import type { PatternType, PatternParams } from '@/components';

export interface BossPhase {
  healthThreshold: number;
  patterns: { type: PatternType; params: PatternParams }[];
}

export interface BossDef {
  name: string;
  health: number;
  score: number;
  phases: BossPhase[];
}

export const MID_BOSS: BossDef = {
  name: 'GUARDIAN',
  health: 80,
  score: 5000,
  phases: [
    {
      healthThreshold: 1.0,
      patterns: [
        { type: 'ring', params: { bulletCount: 12, speed: 2.5, rotationOffset: 0, fireRate: 800 } },
        { type: 'aimed', params: { bulletCount: 3, spreadAngle: Math.PI / 6, speed: 4, fireRate: 1200 } },
      ],
    },
    {
      healthThreshold: 0.5,
      patterns: [
        { type: 'spiral', params: { bulletCount: 1, speed: 3, arms: 4, rotationSpeed: 0.08, bulletInterval: 0, fireRate: 100 } },
        { type: 'fan', params: { bulletCount: 5, spreadAngle: Math.PI / 3, speed: 3.5, fireRate: 1000 } },
      ],
    },
  ],
};

export const FINAL_BOSS: BossDef = {
  name: 'OVERLORD',
  health: 160,
  score: 15000,
  phases: [
    {
      healthThreshold: 1.0,
      patterns: [
        { type: 'ring', params: { bulletCount: 16, speed: 2, rotationOffset: 0, fireRate: 600 } },
      ],
    },
    {
      healthThreshold: 0.66,
      patterns: [
        { type: 'spiral', params: { bulletCount: 1, speed: 3, arms: 5, rotationSpeed: 0.06, bulletInterval: 0, fireRate: 80 } },
        { type: 'aimed', params: { bulletCount: 5, spreadAngle: Math.PI / 4, speed: 4.5, fireRate: 900 } },
      ],
    },
    {
      healthThreshold: 0.33,
      patterns: [
        { type: 'spiral', params: { bulletCount: 1, speed: 3.5, arms: 6, rotationSpeed: 0.1, bulletInterval: 0, fireRate: 60 } },
        { type: 'ring', params: { bulletCount: 20, speed: 2.5, rotationOffset: 0, fireRate: 500 } },
        { type: 'random', params: { bulletCount: 6, speed: 3, angleRange: Math.PI * 2, fireRate: 400 } },
      ],
    },
  ],
};
