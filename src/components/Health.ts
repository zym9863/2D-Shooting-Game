import { Component } from '@/ecs';

export class Health extends Component {
  static readonly type = 'Health';
  invincibleTimer = 0;
  constructor(
    public current: number,
    public max: number,
  ) { super(); }
}
