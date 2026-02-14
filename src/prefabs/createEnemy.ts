import { Entity } from '@/ecs';
import { Transform, Velocity, Health, Collider, SpriteC, EnemyTag, BulletPattern } from '@/components';
import { drawEnemyDiamond, drawEnemyHexagon, drawEnemySquare } from './drawShapes';
import type { EnemyDef } from '@/data/enemies';
import type { Container } from 'pixi.js';

const DRAW_MAP: Record<string, () => Container> = {
  diamond: drawEnemyDiamond,
  hexagon: drawEnemyHexagon,
  square: drawEnemySquare,
};

export function createEnemy(def: EnemyDef, x: number, y: number, stage: Container): Entity {
  const drawFn = DRAW_MAP[def.type] ?? drawEnemyDiamond;
  const display = drawFn();
  stage.addChild(display);

  const entity = new Entity();
  entity
    .addComponent(new Transform(x, y))
    .addComponent(new Velocity(0, def.speed))
    .addComponent(new Health(def.health, def.health))
    .addComponent(new Collider(14, 'enemy'))
    .addComponent(new SpriteC(display))
    .addComponent(new EnemyTag(def.type))
    .addComponent(new BulletPattern(def.pattern.type, { ...def.pattern.params }));

  const tag = entity.getComponent<EnemyTag>(EnemyTag)!;
  tag.scoreValue = def.score;

  return entity;
}
