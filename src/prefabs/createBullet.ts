import { Entity } from '@/ecs';
import { Transform, Velocity, BulletTag, SpriteC, Collider } from '@/components';
import { drawBullet } from './drawShapes';
import type { Faction } from '@/components';
import type { Container } from 'pixi.js';

export function createBullet(
  x: number, y: number,
  vx: number, vy: number,
  faction: Faction,
  damage: number,
  color: number,
  radius: number,
  stage: Container,
): Entity {
  const graphic = drawBullet(color, radius);
  stage.addChild(graphic);

  const entity = new Entity();
  entity
    .addComponent(new Transform(x, y))
    .addComponent(new Velocity(vx, vy))
    .addComponent(new BulletTag(faction, damage))
    .addComponent(new Collider(radius, faction === 'player' ? 'playerBullet' : 'enemyBullet'))
    .addComponent(new SpriteC(graphic));
  return entity;
}
