import { System, World } from '@/ecs';
import { Transform, BulletPattern, EnemyTag, PlayerTag } from '@/components';
import { createBullet } from '@/prefabs/createBullet';
import { angleBetween, TAU, randomRange } from '@/utils/math';
import type { Container } from 'pixi.js';

export class BulletPatternSystem extends System {
  priority = 30;
  private stage: Container;

  constructor(stage: Container) {
    super();
    this.stage = stage;
  }

  update(world: World, dt: number): void {
    const player = world.queryFirst(PlayerTag, Transform);
    const playerT = player?.getComponent<Transform>(Transform);

    for (const entity of world.query(EnemyTag, Transform, BulletPattern)) {
      const t = entity.getComponent<Transform>(Transform)!;
      const bp = entity.getComponent<BulletPattern>(BulletPattern)!;
      bp.elapsed += dt * (1000 / 60);

      if (bp.elapsed - bp.currentAngle < bp.params.fireRate) continue;
      bp.currentAngle = bp.elapsed;

      const { patternType, params } = bp;
      switch (patternType) {
        case 'fan':
          this.fireFan(world, t.x, t.y, params.bulletCount, params.spreadAngle ?? Math.PI / 4, params.speed, playerT);
          break;
        case 'ring':
          this.fireRing(world, t.x, t.y, params.bulletCount, params.speed, params.rotationOffset ?? 0);
          bp.params.rotationOffset = (bp.params.rotationOffset ?? 0) + 0.15;
          break;
        case 'spiral':
          this.fireSpiral(world, t.x, t.y, bp);
          break;
        case 'aimed':
          this.fireAimed(world, t.x, t.y, params.bulletCount, params.spreadAngle ?? 0, params.speed, playerT);
          break;
        case 'random':
          this.fireRandom(world, t.x, t.y, params.bulletCount, params.speed);
          break;
      }
    }
  }

  private fireFan(world: World, x: number, y: number, count: number, spread: number, speed: number, playerT?: Transform): void {
    const baseAngle = playerT ? angleBetween(x, y, playerT.x, playerT.y) : Math.PI / 2;
    for (let i = 0; i < count; i++) {
      const angle = baseAngle - spread / 2 + (spread / (count - 1 || 1)) * i;
      world.addEntity(createBullet(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, 'enemy', 1, 0xff66aa, 5, this.stage));
    }
  }

  private fireRing(world: World, x: number, y: number, count: number, speed: number, offset: number): void {
    for (let i = 0; i < count; i++) {
      const angle = offset + (TAU / count) * i;
      world.addEntity(createBullet(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, 'enemy', 1, 0xcc66ff, 4, this.stage));
    }
  }

  private fireSpiral(world: World, x: number, y: number, bp: BulletPattern): void {
    const arms = bp.params.arms ?? 3;
    const speed = bp.params.speed;
    const rotSpeed = bp.params.rotationSpeed ?? 0.1;
    bp.params.rotationOffset = (bp.params.rotationOffset ?? 0) + rotSpeed;
    const offset = bp.params.rotationOffset;
    for (let i = 0; i < arms; i++) {
      const angle = offset + (TAU / arms) * i;
      world.addEntity(createBullet(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, 'enemy', 1, 0xff8844, 4, this.stage));
    }
  }

  private fireAimed(world: World, x: number, y: number, count: number, spread: number, speed: number, playerT?: Transform): void {
    const baseAngle = playerT ? angleBetween(x, y, playerT.x, playerT.y) : Math.PI / 2;
    if (count === 1) {
      world.addEntity(createBullet(x, y, Math.cos(baseAngle) * speed, Math.sin(baseAngle) * speed, 'enemy', 1, 0xff4444, 5, this.stage));
    } else {
      for (let i = 0; i < count; i++) {
        const angle = baseAngle - spread / 2 + (spread / (count - 1)) * i;
        world.addEntity(createBullet(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, 'enemy', 1, 0xff4444, 5, this.stage));
      }
    }
  }

  private fireRandom(world: World, x: number, y: number, count: number, speed: number): void {
    for (let i = 0; i < count; i++) {
      const angle = randomRange(0, TAU);
      const s = randomRange(speed * 0.6, speed * 1.4);
      world.addEntity(createBullet(x, y, Math.cos(angle) * s, Math.sin(angle) * s, 'enemy', 1, 0xffaa44, 4, this.stage));
    }
  }
}
