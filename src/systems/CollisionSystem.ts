import { System, World, Entity } from '@/ecs';
import { Transform, Collider, BulletTag, PlayerTag, EnemyTag, PowerUpC } from '@/components';
import { SpatialHash } from '@/utils/spatial-hash';
import { distance } from '@/utils/math';
import { CONFIG } from '@/game/config';

export interface CollisionEvent {
  entityA: Entity;
  entityB: Entity;
  type: 'playerBullet_enemy' | 'enemyBullet_player' | 'player_powerUp' | 'player_enemy';
}

export class CollisionSystem extends System {
  priority = 60;
  readonly events: CollisionEvent[] = [];
  private hash = new SpatialHash(CONFIG.SPATIAL_HASH_CELL_SIZE);

  update(world: World, _dt: number): void {
    this.events.length = 0;
    this.hash.clear();

    const collidables = world.query(Transform, Collider);
    for (const entity of collidables) {
      const t = entity.getComponent<Transform>(Transform)!;
      const c = entity.getComponent<Collider>(Collider)!;
      this.hash.insert(entity, t.x, t.y, c.radius);
    }

    // player bullets vs enemies
    for (const bullet of world.query(BulletTag, Transform, Collider)) {
      const bt = bullet.getComponent<BulletTag>(BulletTag)!;
      if (bt.faction !== 'player') continue;
      const bTransform = bullet.getComponent<Transform>(Transform)!;
      const bCollider = bullet.getComponent<Collider>(Collider)!;

      const nearby = this.hash.query(bTransform.x, bTransform.y, bCollider.radius + 20);
      for (const other of nearby) {
        if (!other.hasComponent(EnemyTag)) continue;
        const oT = other.getComponent<Transform>(Transform)!;
        const oC = other.getComponent<Collider>(Collider)!;
        if (distance(bTransform.x, bTransform.y, oT.x, oT.y) < bCollider.radius + oC.radius) {
          this.events.push({ entityA: bullet, entityB: other, type: 'playerBullet_enemy' });
        }
      }
    }

    // enemy bullets vs player
    const player = world.queryFirst(PlayerTag, Transform, Collider);
    if (player) {
      const pT = player.getComponent<Transform>(Transform)!;
      const pC = player.getComponent<Collider>(Collider)!;

      for (const bullet of world.query(BulletTag, Transform, Collider)) {
        const bt = bullet.getComponent<BulletTag>(BulletTag)!;
        if (bt.faction !== 'enemy') continue;
        const bT = bullet.getComponent<Transform>(Transform)!;
        const bC = bullet.getComponent<Collider>(Collider)!;
        if (distance(pT.x, pT.y, bT.x, bT.y) < pC.radius + bC.radius) {
          this.events.push({ entityA: bullet, entityB: player, type: 'enemyBullet_player' });
        }
      }

      // player vs enemies (contact damage)
      for (const enemy of world.query(EnemyTag, Transform, Collider)) {
        const eT = enemy.getComponent<Transform>(Transform)!;
        const eC = enemy.getComponent<Collider>(Collider)!;
        if (distance(pT.x, pT.y, eT.x, eT.y) < pC.radius + eC.radius) {
          this.events.push({ entityA: player, entityB: enemy, type: 'player_enemy' });
        }
      }

      // player vs powerups
      for (const pu of world.query(PowerUpC, Transform, Collider)) {
        const puT = pu.getComponent<Transform>(Transform)!;
        const puC = pu.getComponent<Collider>(Collider)!;
        if (distance(pT.x, pT.y, puT.x, puT.y) < pC.radius + puC.radius + 16) {
          this.events.push({ entityA: player, entityB: pu, type: 'player_powerUp' });
        }
      }
    }
  }
}
