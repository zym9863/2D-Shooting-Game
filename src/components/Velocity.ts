import { Component } from '@/ecs';

export class Velocity extends Component {
  static readonly type = 'Velocity';
  constructor(
    public vx = 0,
    public vy = 0,
    public angularVelocity = 0,
  ) { super(); }
}
