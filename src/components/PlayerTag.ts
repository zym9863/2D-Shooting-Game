import { Component } from '@/ecs';

export class PlayerTag extends Component {
  static readonly type = 'PlayerTag';
  bombs = 3;
  score = 0;
  slowMode = false;
  shieldActive = false;
}
