import { System, World } from '@/ecs';
import { Transform, Velocity, EnemyTag, SpriteC } from '@/components';
import { CONFIG } from '@/game/config';

export class EnemySystem extends System {
  priority = 20;

  update(world: World, dt: number): void {
    for (const entity of world.query(EnemyTag, Transform, Velocity)) {
      const tag = entity.getComponent<EnemyTag>(EnemyTag)!;
      const t = entity.getComponent<Transform>(Transform)!;
      const v = entity.getComponent<Velocity>(Velocity)!;

      if (tag.enemyType === 'miniBoss' || tag.enemyType === 'finalBoss') {
        if (t.y >= 100 && v.vy > 0) {
          v.vy = 0;
          v.vx = 1;
        }
        if (t.x < 60) v.vx = Math.abs(v.vx);
        if (t.x > CONFIG.GAME_WIDTH - 60) v.vx = -Math.abs(v.vx);
        t.rotation += 0.005 * dt;
        continue;
      }

      if (t.y > CONFIG.GAME_HEIGHT + 60) {
        const sprite = entity.getComponent<SpriteC>(SpriteC);
        if (sprite) sprite.display.destroy();
        world.removeEntity(entity);
      }
    }
  }
}
