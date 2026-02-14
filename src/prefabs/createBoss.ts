import { Entity } from '@/ecs';
import { Transform, Velocity, Health, Collider, SpriteC, EnemyTag, BulletPattern } from '@/components';
import type { BossDef } from '@/data/bosses';
import { Container, Graphics, BlurFilter } from 'pixi.js';

function drawBoss(isFinal: boolean): Container {
  const container = new Container();
  const color = isFinal ? 0xff2266 : 0xff8800;
  const size = isFinal ? 40 : 30;

  const ring = new Graphics();
  const points: number[] = [];
  const sides = isFinal ? 8 : 6;
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
    points.push(Math.cos(angle) * size, Math.sin(angle) * size);
  }
  ring.poly(points);
  ring.stroke({ color, width: 2 });
  ring.fill({ color, alpha: 0.1 });
  container.addChild(ring);

  const core = new Graphics();
  core.circle(0, 0, size * 0.4);
  core.fill({ color, alpha: 0.3 });
  core.stroke({ color: 0xffffff, width: 1 });
  container.addChild(core);

  const glow = new Graphics();
  glow.circle(0, 0, size * 0.6);
  glow.fill({ color, alpha: 0.15 });
  glow.filters = [new BlurFilter({ strength: 8, quality: 2 })];
  container.addChildAt(glow, 0);

  return container;
}

export function createBoss(def: BossDef, x: number, y: number, stage: Container): Entity {
  const isFinal = def.health > 100;
  const display = drawBoss(isFinal);
  stage.addChild(display);

  const entity = new Entity();
  const firstPattern = def.phases[0].patterns[0];
  entity
    .addComponent(new Transform(x, -40))
    .addComponent(new Velocity(0, 0.8))
    .addComponent(new Health(def.health, def.health))
    .addComponent(new Collider(isFinal ? 36 : 28, 'enemy'))
    .addComponent(new SpriteC(display))
    .addComponent(new EnemyTag(isFinal ? 'finalBoss' : 'miniBoss'))
    .addComponent(new BulletPattern(firstPattern.type, { ...firstPattern.params }));

  const tag = entity.getComponent<EnemyTag>(EnemyTag)!;
  tag.scoreValue = def.score;

  (entity as any).__bossDef = def;
  (entity as any).__currentPhase = 0;

  return entity;
}
