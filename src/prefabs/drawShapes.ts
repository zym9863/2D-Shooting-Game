import { Graphics, Container, BlurFilter } from 'pixi.js';

export function drawPlayerShip(): Container {
  const container = new Container();
  const body = new Graphics();
  body.poly([0, -18, -12, 14, 12, 14]);
  body.fill({ color: 0x00ffcc, alpha: 0.15 });
  body.stroke({ color: 0x00ffcc, width: 2 });
  container.addChild(body);

  const glow = new Graphics();
  glow.poly([0, -18, -12, 14, 12, 14]);
  glow.stroke({ color: 0x00ffcc, width: 4, alpha: 0.4 });
  glow.filters = [new BlurFilter({ strength: 6, quality: 2 })];
  container.addChildAt(glow, 0);

  return container;
}

export function drawHitbox(): Graphics {
  const g = new Graphics();
  g.circle(0, 0, 3);
  g.fill({ color: 0xffffff, alpha: 0.9 });
  g.visible = false;
  return g;
}

export function drawEnemyDiamond(): Container {
  const container = new Container();
  const body = new Graphics();
  body.poly([0, -14, 12, 0, 0, 14, -12, 0]);
  body.fill({ color: 0xff3366, alpha: 0.2 });
  body.stroke({ color: 0xff3366, width: 2 });
  container.addChild(body);
  return container;
}

export function drawEnemyHexagon(): Container {
  const container = new Container();
  const body = new Graphics();
  const r = 14;
  const points: number[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    points.push(Math.cos(angle) * r, Math.sin(angle) * r);
  }
  body.poly(points);
  body.fill({ color: 0xff8800, alpha: 0.2 });
  body.stroke({ color: 0xff8800, width: 2 });
  container.addChild(body);
  return container;
}

export function drawEnemySquare(): Container {
  const container = new Container();
  const body = new Graphics();
  body.rect(-10, -10, 20, 20);
  body.fill({ color: 0xaa44ff, alpha: 0.2 });
  body.stroke({ color: 0xaa44ff, width: 2 });
  container.addChild(body);
  return container;
}

export function drawBullet(color: number, radius: number): Graphics {
  const g = new Graphics();
  g.circle(0, 0, radius);
  g.fill({ color, alpha: 0.9 });
  return g;
}

export function drawPowerUp(color: number): Container {
  const container = new Container();
  const body = new Graphics();
  body.circle(0, 0, 8);
  body.fill({ color, alpha: 0.4 });
  body.stroke({ color, width: 2 });
  container.addChild(body);

  const glow = new Graphics();
  glow.circle(0, 0, 8);
  glow.stroke({ color, width: 3, alpha: 0.3 });
  glow.filters = [new BlurFilter({ strength: 4, quality: 2 })];
  container.addChildAt(glow, 0);

  return container;
}
