import { System, World } from '@/ecs';
import { Transform, BulletTag, SpriteC } from '@/components';
import { CONFIG } from '@/game/config';

export class BulletSystem extends System {
  priority = 55;

  update(world: World, _dt: number): void {
    const margin = 40;
    for (const entity of world.query(BulletTag, Transform)) {
      const t = entity.getComponent<Transform>(Transform)!;
      if (t.x < -margin || t.x > CONFIG.GAME_WIDTH + margin ||
          t.y < -margin || t.y > CONFIG.GAME_HEIGHT + margin) {
        const sprite = entity.getComponent<SpriteC>(SpriteC);
        if (sprite) sprite.display.destroy();
        world.removeEntity(entity);
      }
    }
  }
}
