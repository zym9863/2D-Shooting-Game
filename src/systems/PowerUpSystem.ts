import { System, World } from '@/ecs';
import { Transform, PowerUpC, SpriteC } from '@/components';
import { CONFIG } from '@/game/config';

export class PowerUpSystem extends System {
  priority = 70;

  update(world: World, _dt: number): void {
    for (const entity of world.query(PowerUpC, Transform)) {
      const t = entity.getComponent<Transform>(Transform)!;
      if (t.y > CONFIG.GAME_HEIGHT + 20) {
        const s = entity.getComponent<SpriteC>(SpriteC);
        if (s) s.display.destroy();
        world.removeEntity(entity);
      }
    }
  }
}
