import { Component } from '@/ecs';

export type ColliderLayer = 'player' | 'playerBullet' | 'enemy' | 'enemyBullet' | 'powerUp';

export class Collider extends Component {
  static readonly type = 'Collider';
  constructor(
    public radius: number,
    public layer: ColliderLayer,
  ) { super(); }
}
