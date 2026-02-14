import { Component } from '@/ecs';

export class Transform extends Component {
  static readonly type = 'Transform';
  constructor(
    public x = 0,
    public y = 0,
    public rotation = 0,
    public scaleX = 1,
    public scaleY = 1,
  ) { super(); }
}
