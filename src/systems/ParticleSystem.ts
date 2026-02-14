import { System, World } from '@/ecs';
import { Graphics, Container } from 'pixi.js';

interface Particle {
  graphic: Graphics;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: number;
}

export class ParticleSystem extends System {
  priority = 90;
  private particles: Particle[] = [];
  private stage: Container;

  constructor(stage: Container) {
    super();
    this.stage = stage;
  }

  emit(x: number, y: number, color: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4;
      const graphic = new Graphics();
      const size = 1 + Math.random() * 3;
      graphic.rect(-size / 2, -size / 2, size, size);
      graphic.fill({ color });
      graphic.x = x;
      graphic.y = y;
      this.stage.addChild(graphic);

      this.particles.push({
        graphic,
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 30 + Math.random() * 20,
        maxLife: 30 + Math.random() * 20,
        color,
      });
    }
  }

  update(_world: World, dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.graphic.x = p.x;
      p.graphic.y = p.y;
      p.graphic.alpha = Math.max(0, p.life / p.maxLife);

      if (p.life <= 0) {
        p.graphic.destroy();
        this.particles.splice(i, 1);
      }
    }
  }

  clear(): void {
    for (const p of this.particles) {
      p.graphic.destroy();
    }
    this.particles.length = 0;
  }
}
