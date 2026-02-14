import { Component } from '@/ecs';

export type WeaponType = 'vulcan' | 'spread' | 'laser';

export class Weapon extends Component {
  static readonly type = 'Weapon';
  lastFiredAt = 0;
  constructor(
    public weaponType: WeaponType = 'vulcan',
    public level = 1,
    public fireRate = 100,
  ) { super(); }
}
