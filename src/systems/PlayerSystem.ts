import { System, World } from '@/ecs';
import { Transform, Velocity, PlayerTag, Weapon } from '@/components';
import { InputSystem } from './InputSystem';
import { CONFIG } from '@/game/config';
import { clamp } from '@/utils/math';
import type { Graphics } from 'pixi.js';

export class PlayerSystem extends System {
  priority = 10;
  private input: InputSystem;
  private hitbox: Graphics | null = null;

  constructor(input: InputSystem, hitbox?: Graphics) {
    super();
    this.input = input;
    this.hitbox = hitbox ?? null;
  }

  update(world: World, _dt: number): void {
    const player = world.queryFirst(PlayerTag, Transform, Velocity);
    if (!player) return;

    const tag = player.getComponent<PlayerTag>(PlayerTag)!;
    const transform = player.getComponent<Transform>(Transform)!;
    const velocity = player.getComponent<Velocity>(Velocity)!;
    const weapon = player.getComponent<Weapon>(Weapon);

    tag.slowMode = this.input.state.slow;
    if (this.hitbox) this.hitbox.visible = tag.slowMode;

    const speed = tag.slowMode ? CONFIG.PLAYER_SLOW_SPEED : CONFIG.PLAYER_SPEED;
    let vx = 0, vy = 0;
    if (this.input.state.left) vx -= 1;
    if (this.input.state.right) vx += 1;
    if (this.input.state.up) vy -= 1;
    if (this.input.state.down) vy += 1;

    if (vx !== 0 && vy !== 0) {
      const inv = 1 / Math.SQRT2;
      vx *= inv;
      vy *= inv;
    }
    velocity.vx = vx * speed;
    velocity.vy = vy * speed;

    transform.x = clamp(transform.x, 16, CONFIG.GAME_WIDTH - 16);
    transform.y = clamp(transform.y, 16, CONFIG.GAME_HEIGHT - 16);

    if (weapon) {
      if (this.input.state.weapon1) { weapon.weaponType = 'vulcan'; weapon.fireRate = 100; }
      if (this.input.state.weapon2) { weapon.weaponType = 'spread'; weapon.fireRate = 200; }
      if (this.input.state.weapon3) { weapon.weaponType = 'laser'; weapon.fireRate = 50; }
    }
  }
}
