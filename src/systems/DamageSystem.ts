import { System, World } from '@/ecs';
import { Health, BulletTag, SpriteC, PlayerTag, EnemyTag, Weapon, PowerUpC, Transform } from '@/components';
import { CollisionSystem } from './CollisionSystem';
import { CONFIG } from '@/game/config';

export class DamageSystem extends System {
  priority = 65;
  private collision: CollisionSystem;
  onPlayerDeath?: () => void;
  onEnemyKilled?: (x: number, y: number, score: number) => void;

  constructor(collision: CollisionSystem) {
    super();
    this.collision = collision;
  }

  update(world: World, dt: number): void {
    // tick invincibility timers
    const player = world.queryFirst(PlayerTag, Health);
    if (player) {
      const ph = player.getComponent<Health>(Health)!;
      if (ph.invincibleTimer > 0) {
        ph.invincibleTimer -= dt * (1000 / 60);
        const sprite = player.getComponent<SpriteC>(SpriteC);
        if (sprite) sprite.display.alpha = Math.sin(ph.invincibleTimer * 0.3) > 0 ? 1 : 0.3;
      } else {
        const sprite = player.getComponent<SpriteC>(SpriteC);
        if (sprite) sprite.display.alpha = 1;
      }
    }

    for (const event of this.collision.events) {
      switch (event.type) {
        case 'playerBullet_enemy': {
          const bullet = event.entityA;
          const enemy = event.entityB;
          const bt = bullet.getComponent<BulletTag>(BulletTag)!;
          const eh = enemy.getComponent<Health>(Health);

          if (!bt.piercing) {
            const bs = bullet.getComponent<SpriteC>(SpriteC);
            if (bs) bs.display.destroy();
            world.removeEntity(bullet);
          }

          if (eh) {
            eh.current -= bt.damage;
            if (eh.current <= 0) {
              const tag = enemy.getComponent<EnemyTag>(EnemyTag);
              const et = enemy.getComponent<Transform>(Transform);
              const es = enemy.getComponent<SpriteC>(SpriteC);
              if (es) es.display.destroy();
              world.removeEntity(enemy);
              if (tag && et && this.onEnemyKilled) {
                this.onEnemyKilled(et.x, et.y, tag.scoreValue);
              }
            }
          }
          break;
        }

        case 'enemyBullet_player':
        case 'player_enemy': {
          const playerEntity = event.type === 'enemyBullet_player' ? event.entityB : event.entityA;
          const other = event.type === 'enemyBullet_player' ? event.entityA : event.entityB;
          const ph = playerEntity.getComponent<Health>(Health);
          const ptag = playerEntity.getComponent<PlayerTag>(PlayerTag);

          if (ph && ph.invincibleTimer <= 0) {
            if (ptag?.shieldActive) {
              ptag.shieldActive = false;
            } else {
              ph.invincibleTimer = CONFIG.PLAYER_INVINCIBLE_TIME;
              if (this.onPlayerDeath) this.onPlayerDeath();
            }
          }

          if (event.type === 'enemyBullet_player') {
            const bs = other.getComponent<SpriteC>(SpriteC);
            if (bs) bs.display.destroy();
            world.removeEntity(other);
          }
          break;
        }

        case 'player_powerUp': {
          const playerEntity = event.entityA;
          const pu = event.entityB;
          const ptag = playerEntity.getComponent<PlayerTag>(PlayerTag);
          const puC = pu.getComponent<PowerUpC>(PowerUpC);
          const weapon = playerEntity.getComponent<Weapon>(Weapon);

          if (ptag && puC) {
            switch (puC.powerUpType) {
              case 'power':
                if (weapon && weapon.level < 3) weapon.level++;
                break;
              case 'shield':
                ptag.shieldActive = true;
                break;
              case 'bomb':
                ptag.bombs++;
                break;
              case 'score':
                ptag.score += 500;
                break;
            }
          }
          const pus = pu.getComponent<SpriteC>(SpriteC);
          if (pus) pus.display.destroy();
          world.removeEntity(pu);
          break;
        }
      }
    }
  }
}
