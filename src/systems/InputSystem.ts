import { System } from '@/ecs';
import type { World } from '@/ecs';

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  shoot: boolean;
  slow: boolean;
  bomb: boolean;
  weapon1: boolean;
  weapon2: boolean;
  weapon3: boolean;
}

export class InputSystem extends System {
  priority = 0;
  readonly state: InputState = {
    up: false, down: false, left: false, right: false,
    shoot: false, slow: false, bomb: false,
    weapon1: false, weapon2: false, weapon3: false,
  };
  private keyMap: Record<string, keyof InputState> = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', s: 'down', a: 'left', d: 'right',
    z: 'shoot', Z: 'shoot',
    x: 'bomb', X: 'bomb',
    Shift: 'slow',
    '1': 'weapon1', '2': 'weapon2', '3': 'weapon3',
  };

  constructor() {
    super();
    window.addEventListener('keydown', (e) => {
      const action = this.keyMap[e.key];
      if (action) {
        this.state[action] = true;
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', (e) => {
      const action = this.keyMap[e.key];
      if (action) {
        this.state[action] = false;
      }
    });
  }

  update(_world: World, _dt: number): void {
    // state is updated via event listeners
  }
}
