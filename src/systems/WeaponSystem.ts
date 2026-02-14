import { System, World } from '@/ecs';
import { Transform, PlayerTag, Weapon } from '@/components';
import { InputSystem } from './InputSystem';
import { createBullet } from '@/prefabs/createBullet';
import type { Container } from 'pixi.js';

export class WeaponSystem extends System {
  priority = 40;
  private input: InputSystem;
  private stage: Container;
  private elapsed = 0;

  constructor(input: InputSystem, stage: Container) {
    super();
    this.input = input;
    this.stage = stage;
  }

  update(world: World, dt: number): void {
    this.elapsed += dt * (1000 / 60);

    const player = world.queryFirst(PlayerTag, Transform, Weapon);
    if (!player) return;
    if (!this.input.state.shoot) return;

    const t = player.getComponent<Transform>(Transform)!;
    const w = player.getComponent<Weapon>(Weapon)!;

    if (this.elapsed - w.lastFiredAt < w.fireRate) return;
    w.lastFiredAt = this.elapsed;

    const x = t.x;
    const y = t.y;

    switch (w.weaponType) {
      case 'vulcan':
        this.fireVulcan(world, x, y, w.level);
        break;
      case 'spread':
        this.fireSpread(world, x, y, w.level);
        break;
      case 'laser':
        this.fireLaser(world, x, y, w.level);
        break;
    }
  }

  private fireVulcan(world: World, x: number, y: number, level: number): void {
    const speed = -10;
    const damage = level;
    world.addEntity(createBullet(x, y - 10, 0, speed, 'player', damage, 0x00ffcc, 3, this.stage));
    if (level >= 2) {
      world.addEntity(createBullet(x - 8, y - 6, 0, speed, 'player', damage, 0x00ffcc, 3, this.stage));
      world.addEntity(createBullet(x + 8, y - 6, 0, speed, 'player', damage, 0x00ffcc, 3, this.stage));
    }
    if (level >= 3) {
      world.addEntity(createBullet(x - 14, y - 2, -0.5, speed, 'player', damage, 0x00ffcc, 3, this.stage));
      world.addEntity(createBullet(x + 14, y - 2, 0.5, speed, 'player', damage, 0x00ffcc, 3, this.stage));
    }
  }

  private fireSpread(world: World, x: number, y: number, level: number): void {
    const speed = 9;
    const damage = Math.max(1, level - 1) || 1;
    const count = 2 + level;
    const totalAngle = (Math.PI / 6) * level;
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 - totalAngle / 2 + (totalAngle / (count - 1)) * i;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      world.addEntity(createBullet(x, y - 10, vx, vy, 'player', damage, 0x44ff88, 3, this.stage));
    }
  }

  private fireLaser(world: World, x: number, y: number, level: number): void {
    const speed = -14;
    const damage = level * 0.5;
    world.addEntity(createBullet(x, y - 10, 0, speed, 'player', damage, 0x88ccff, 2, this.stage));
  }
}
