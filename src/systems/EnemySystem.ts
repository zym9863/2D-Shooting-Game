import { System, World } from '@/ecs';
import { Transform, EnemyTag, SpriteC } from '@/components';
import { CONFIG } from '@/game/config';

export class EnemySystem extends System {
  priority = 20;

  update(world: World, _dt: number): void {
    for (const entity of world.query(EnemyTag, Transform)) {
      const t = entity.getComponent<Transform>(Transform)!;
      if (t.y > CONFIG.GAME_HEIGHT + 60) {
        const sprite = entity.getComponent<SpriteC>(SpriteC);
        if (sprite) sprite.display.destroy();
        world.removeEntity(entity);
      }
    }
  }
}
