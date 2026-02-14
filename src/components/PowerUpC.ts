import { Component } from '@/ecs';

export type PowerUpType = 'power' | 'shield' | 'bomb' | 'score';

export class PowerUpC extends Component {
  static readonly type = 'PowerUpC';
  constructor(public powerUpType: PowerUpType) { super(); }
}
