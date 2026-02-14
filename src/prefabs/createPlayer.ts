import { Entity } from '@/ecs';
import { Transform, Velocity, Health, Collider, SpriteC, PlayerTag, Weapon } from '@/components';
import { drawPlayerShip, drawHitbox } from './drawShapes';
import { CONFIG } from '@/game/config';
import { Container } from 'pixi.js';
import type { Graphics } from 'pixi.js';

export function createPlayer(): { entity: Entity; container: Container; hitbox: Graphics } {
  const container = new Container();
  const ship = drawPlayerShip();
  const hitbox = drawHitbox();
  container.addChild(ship);
  container.addChild(hitbox);

  const entity = new Entity();
  entity
    .addComponent(new Transform(CONFIG.GAME_WIDTH / 2, CONFIG.GAME_HEIGHT - 80))
    .addComponent(new Velocity())
    .addComponent(new Health(1, 1))
    .addComponent(new Collider(CONFIG.PLAYER_HITBOX_RADIUS, 'player'))
    .addComponent(new SpriteC(container))
    .addComponent(new PlayerTag())
    .addComponent(new Weapon('vulcan', 1, 100));

  return { entity, container, hitbox };
}
