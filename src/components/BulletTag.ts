import { Component } from '@/ecs';

export type Faction = 'player' | 'enemy';

export class BulletTag extends Component {
  static readonly type = 'BulletTag';
  constructor(
    public faction: Faction,
    public damage = 1,
    public piercing = false,
  ) { super(); }
}
