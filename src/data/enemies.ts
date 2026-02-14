import type { EnemyType } from '@/components';
import type { PatternType, PatternParams } from '@/components';

export interface EnemyDef {
  type: EnemyType;
  health: number;
  speed: number;
  score: number;
  pattern: { type: PatternType; params: PatternParams };
}

export const ENEMY_DEFS: Record<string, EnemyDef> = {
  diamond: {
    type: 'diamond',
    health: 3,
    speed: 1.5,
    score: 100,
    pattern: {
      type: 'fan',
      params: { bulletCount: 3, spreadAngle: Math.PI / 4, speed: 3, fireRate: 1200 },
    },
  },
  hexagon: {
    type: 'hexagon',
    health: 5,
    speed: 1,
    score: 200,
    pattern: {
      type: 'ring',
      params: { bulletCount: 8, speed: 2.5, rotationOffset: 0, fireRate: 1500 },
    },
  },
  square: {
    type: 'square',
    health: 4,
    speed: 1.2,
    score: 150,
    pattern: {
      type: 'aimed',
      params: { bulletCount: 2, spreadAngle: Math.PI / 8, speed: 4, fireRate: 1000 },
    },
  },
};
