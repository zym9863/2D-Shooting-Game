import { Entity } from '@/ecs';
import { Transform, Velocity, Collider, SpriteC, PowerUpC } from '@/components';
import { drawPowerUp } from './drawShapes';
import type { PowerUpType } from '@/components';
import type { Container } from 'pixi.js';

const COLOR_MAP: Record<PowerUpType, number> = {
  power: 0xff4444,
  shield: 0x4488ff,
  bomb: 0xffcc00,
  score: 0x44ff44,
};

export function createPowerUp(type: PowerUpType, x: number, y: number, stage: Container): Entity {
  const color = COLOR_MAP[type];
  const display = drawPowerUp(color);
  stage.addChild(display);

  const entity = new Entity();
  entity
    .addComponent(new Transform(x, y))
    .addComponent(new Velocity(0, 1.5))
    .addComponent(new Collider(10, 'powerUp'))
    .addComponent(new SpriteC(display))
    .addComponent(new PowerUpC(type));
  return entity;
}
