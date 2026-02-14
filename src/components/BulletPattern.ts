import { Component } from '@/ecs';

export type PatternType = 'fan' | 'ring' | 'spiral' | 'aimed' | 'random';

export interface PatternParams {
  bulletCount: number;
  speed: number;
  spreadAngle?: number;
  rotationOffset?: number;
  rotationSpeed?: number;
  arms?: number;
  bulletInterval?: number;
  angleRange?: number;
  speedRange?: [number, number];
  fireRate: number;
}

export class BulletPattern extends Component {
  static readonly type = 'BulletPattern';
  elapsed = 0;
  currentAngle = 0;
  constructor(
    public patternType: PatternType,
    public params: PatternParams,
  ) { super(); }
}
