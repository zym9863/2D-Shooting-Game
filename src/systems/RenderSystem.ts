import { System, World } from '@/ecs';
import { Transform, SpriteC } from '@/components';

export class RenderSystem extends System {
  priority = 100;

  update(world: World, _dt: number): void {
    for (const entity of world.query(Transform, SpriteC)) {
      const t = entity.getComponent<Transform>(Transform)!;
      const s = entity.getComponent<SpriteC>(SpriteC)!;
      s.display.x = t.x;
      s.display.y = t.y;
      s.display.rotation = t.rotation;
      s.display.scale.set(t.scaleX, t.scaleY);
    }
  }
}
