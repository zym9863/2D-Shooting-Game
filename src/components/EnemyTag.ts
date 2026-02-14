import { Component } from '@/ecs';

export type EnemyType = 'diamond' | 'hexagon' | 'square' | 'miniBoss' | 'finalBoss';

export class EnemyTag extends Component {
  static readonly type = 'EnemyTag';
  scoreValue = 100;
  constructor(public enemyType: EnemyType) { super(); }
}
