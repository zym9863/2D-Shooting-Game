import type { World } from './World';

export abstract class System {
  priority = 0;
  abstract update(world: World, dt: number): void;
}
