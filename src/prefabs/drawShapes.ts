import { Graphics, Container, BlurFilter, Filter } from 'pixi.js';
import { CONFIG } from '@/game/config';

const { COLORS } = CONFIG;

/**
 * Creates the player ship with neon glow effect
 * Design: Sleek triangular ship with cyan glow
 */
export function drawPlayerShip(): Container {
  const container = new Container();
  
  // Outer glow (largest, most diffuse)
  const outerGlow = new Graphics();
  outerGlow.poly([0, -22, -16, 18, 16, 18]);
  outerGlow.fill({ color: COLORS.NEON_CYAN, alpha: 0.08 });
  outerGlow.filters = [new BlurFilter({ strength: 12, quality: 3 })];
  container.addChildAt(outerGlow, 0);

  // Middle glow
  const midGlow = new Graphics();
  midGlow.poly([0, -20, -14, 16, 14, 16]);
  midGlow.fill({ color: COLORS.NEON_CYAN, alpha: 0.15 });
  midGlow.filters = [new BlurFilter({ strength: 6, quality: 2 })];
  container.addChildAt(midGlow, 0);

  // Main body with gradient effect
  const body = new Graphics();
  body.poly([0, -18, -12, 14, 12, 14]);
  body.fill({ color: COLORS.BG_VOID, alpha: 0.6 });
  body.stroke({ color: COLORS.NEON_CYAN, width: 2 });
  container.addChild(body);

  // Inner detail lines
  const inner = new Graphics();
  inner.poly([0, -12, -6, 10, 6, 10]);
  inner.stroke({ color: COLORS.NEON_CYAN, width: 1, alpha: 0.5 });
  container.addChild(inner);

  // Core highlight
  const core = new Graphics();
  core.circle(0, 0, 3);
  core.fill({ color: COLORS.NEON_CYAN, alpha: 0.8 });
  container.addChild(core);

  // Engine trail effect
  const engine = new Graphics();
  engine.poly([0, 14, -4, 22, 0, 18, 4, 22]);
  engine.fill({ color: COLORS.NEON_CYAN, alpha: 0.4 });
  engine.filters = [new BlurFilter({ strength: 3, quality: 1 })];
  container.addChild(engine);

  return container;
}

/**
 * Creates the player hitbox indicator
 * Design: Small bright dot, visible only when focusing
 */
export function drawHitbox(): Graphics {
  const g = new Graphics();
  
  // Outer ring
  g.circle(0, 0, 5);
  g.stroke({ color: COLORS.TEXT_BRIGHT, width: 1, alpha: 0.5 });
  
  // Inner core
  g.circle(0, 0, 3);
  g.fill({ color: COLORS.TEXT_BRIGHT, alpha: 0.9 });
  
  g.visible = false;
  return g;
}

/**
 * Creates diamond-shaped enemy
 * Design: Aggressive pink/red diamond with glow
 */
export function drawEnemyDiamond(): Container {
  const container = new Container();
  
  // Glow layer
  const glow = new Graphics();
  glow.poly([0, -18, 14, 0, 0, 18, -14, 0]);
  glow.fill({ color: COLORS.ENEMY_PRIMARY, alpha: 0.1 });
  glow.filters = [new BlurFilter({ strength: 6, quality: 2 })];
  container.addChildAt(glow, 0);

  // Main body
  const body = new Graphics();
  body.poly([0, -14, 12, 0, 0, 14, -12, 0]);
  body.fill({ color: COLORS.BG_VOID, alpha: 0.5 });
  body.stroke({ color: COLORS.ENEMY_PRIMARY, width: 2 });
  container.addChild(body);

  // Inner core
  const core = new Graphics();
  core.circle(0, 0, 3);
  core.fill({ color: COLORS.ENEMY_PRIMARY, alpha: 0.8 });
  container.addChild(core);

  return container;
}

/**
 * Creates hexagon-shaped enemy
 * Design: Orange hexagon with rotating animation potential
 */
export function drawEnemyHexagon(): Container {
  const container = new Container();
  const r = 14;
  const points: number[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    points.push(Math.cos(angle) * r, Math.sin(angle) * r);
  }
  
  // Glow layer
  const glow = new Graphics();
  const glowPoints = points.map(p => p * 1.2);
  glow.poly(glowPoints);
  glow.fill({ color: COLORS.ENEMY_SECONDARY, alpha: 0.1 });
  glow.filters = [new BlurFilter({ strength: 6, quality: 2 })];
  container.addChildAt(glow, 0);

  // Main body
  const body = new Graphics();
  body.poly(points);
  body.fill({ color: COLORS.BG_VOID, alpha: 0.5 });
  body.stroke({ color: COLORS.ENEMY_SECONDARY, width: 2 });
  container.addChild(body);

  // Inner hexagon
  const inner = new Graphics();
  const innerPoints: number[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    innerPoints.push(Math.cos(angle) * 6, Math.sin(angle) * 6);
  }
  inner.poly(innerPoints);
  inner.stroke({ color: COLORS.ENEMY_SECONDARY, width: 1, alpha: 0.5 });
  container.addChild(inner);

  return container;
}

/**
 * Creates square-shaped enemy
 * Design: Purple square with tech aesthetic
 */
export function drawEnemySquare(): Container {
  const container = new Container();
  
  // Glow layer
  const glow = new Graphics();
  glow.rect(-14, -14, 28, 28);
  glow.fill({ color: COLORS.ENEMY_ELITE, alpha: 0.1 });
  glow.filters = [new BlurFilter({ strength: 6, quality: 2 })];
  container.addChildAt(glow, 0);

  // Main body
  const body = new Graphics();
  body.rect(-10, -10, 20, 20);
  body.fill({ color: COLORS.BG_VOID, alpha: 0.5 });
  body.stroke({ color: COLORS.ENEMY_ELITE, width: 2 });
  container.addChild(body);

  // Inner cross pattern
  const cross = new Graphics();
  cross.moveTo(-5, 0);
  cross.lineTo(5, 0);
  cross.moveTo(0, -5);
  cross.lineTo(0, 5);
  cross.stroke({ color: COLORS.ENEMY_ELITE, width: 1, alpha: 0.6 });
  container.addChild(cross);

  return container;
}

/**
 * Creates a bullet with glow effect
 * Design: Simple glowing orb
 */
export function drawBullet(color: number, radius: number): Graphics {
  const g = new Graphics();
  
  // Outer glow
  g.circle(0, 0, radius * 1.5);
  g.fill({ color, alpha: 0.2 });
  
  // Main body
  g.circle(0, 0, radius);
  g.fill({ color, alpha: 0.9 });
  
  // Bright core
  g.circle(0, 0, radius * 0.4);
  g.fill({ color: COLORS.TEXT_BRIGHT, alpha: 0.8 });
  
  return g;
}

/**
 * Creates a power-up item with pulsing glow
 * Design: Glowing orb with ring
 */
export function drawPowerUp(color: number): Container {
  const container = new Container();
  
  // Outer pulse ring
  const ring = new Graphics();
  ring.circle(0, 0, 12);
  ring.stroke({ color, width: 1, alpha: 0.3 });
  container.addChild(ring);

  // Glow layer
  const glow = new Graphics();
  glow.circle(0, 0, 10);
  glow.fill({ color, alpha: 0.15 });
  glow.filters = [new BlurFilter({ strength: 6, quality: 2 })];
  container.addChildAt(glow, 0);

  // Main body
  const body = new Graphics();
  body.circle(0, 0, 8);
  body.fill({ color: COLORS.BG_VOID, alpha: 0.4 });
  body.stroke({ color, width: 2 });
  container.addChild(body);

  // Inner symbol based on color
  const inner = new Graphics();
  if (color === COLORS.POWERUP_WEAPON) {
    // Weapon: Arrow up
    inner.poly([0, -4, 3, 2, -3, 2]);
    inner.fill({ color, alpha: 0.9 });
  } else if (color === COLORS.POWERUP_HEALTH) {
    // Health: Plus sign
    inner.rect(-1, -4, 2, 8);
    inner.rect(-4, -1, 8, 2);
    inner.fill({ color, alpha: 0.9 });
  } else {
    // Bomb: Diamond
    inner.poly([0, -4, 4, 0, 0, 4, -4, 0]);
    inner.fill({ color, alpha: 0.9 });
  }
  container.addChild(inner);

  return container;
}

/**
 * Creates a boss entity with multiple components
 * Design: Large, menacing structure with multiple glow layers
 */
export function drawBoss(phase: number = 0): Container {
  const container = new Container();
  
  // Color based on phase
  const phaseColors = [
    COLORS.NEON_PURPLE,
    COLORS.NEON_PINK,
    COLORS.NEON_ORANGE,
  ];
  const color = phaseColors[phase % phaseColors.length];
  
  // Outer aura
  const aura = new Graphics();
  aura.circle(0, 0, 50);
  aura.fill({ color, alpha: 0.05 });
  aura.filters = [new BlurFilter({ strength: 15, quality: 3 })];
  container.addChildAt(aura, 0);
  
  // Main body - hexagonal core
  const core = new Graphics();
  const corePoints: number[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    corePoints.push(Math.cos(angle) * 35, Math.sin(angle) * 35);
  }
  core.poly(corePoints);
  core.fill({ color: COLORS.BG_VOID, alpha: 0.7 });
  core.stroke({ color, width: 3 });
  container.addChild(core);
  
  // Inner details
  const inner = new Graphics();
  const innerPoints: number[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    innerPoints.push(Math.cos(angle) * 20, Math.sin(angle) * 20);
  }
  inner.poly(innerPoints);
  inner.stroke({ color, width: 2, alpha: 0.6 });
  container.addChild(inner);
  
  // Center eye
  const eye = new Graphics();
  eye.circle(0, 0, 8);
  eye.fill({ color, alpha: 0.9 });
  eye.circle(0, 0, 4);
  eye.fill({ color: COLORS.TEXT_BRIGHT, alpha: 0.9 });
  container.addChild(eye);
  
  // Wing extensions
  const leftWing = new Graphics();
  leftWing.poly([-35, 0, -55, -15, -50, 0, -55, 15]);
  leftWing.fill({ color: COLORS.BG_VOID, alpha: 0.6 });
  leftWing.stroke({ color, width: 2 });
  container.addChild(leftWing);
  
  const rightWing = new Graphics();
  rightWing.poly([35, 0, 55, -15, 50, 0, 55, 15]);
  rightWing.fill({ color: COLORS.BG_VOID, alpha: 0.6 });
  rightWing.stroke({ color, width: 2 });
  container.addChild(rightWing);
  
  return container;
}
