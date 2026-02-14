import { System, World } from '@/ecs';
import { Transform, Velocity } from '@/components';

export class MovementSystem extends System {
  priority = 50;

  update(world: World, dt: number): void {
    for (const entity of world.query(Transform, Velocity)) {
      const t = entity.getComponent<Transform>(Transform)!;
      const v = entity.getComponent<Velocity>(Velocity)!;
      t.x += v.vx * dt;
      t.y += v.vy * dt;
      t.rotation += v.angularVelocity * dt;
    }
  }
}
