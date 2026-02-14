import { Component } from '@/ecs';
import type { Container } from 'pixi.js';

export class SpriteC extends Component {
  static readonly type = 'SpriteC';
  constructor(public display: Container) { super(); }
}
