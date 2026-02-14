import { System, World } from '@/ecs';
import { Graphics, Container } from 'pixi.js';
import { CONFIG } from '@/game/config';

interface Star {
  graphic: Graphics;
  speed: number;
}

export class BackgroundSystem extends System {
  priority = -10;
  private stars: Star[] = [];
  private container: Container;

  constructor(stage: Container) {
    super();
    this.container = new Container();
    stage.addChildAt(this.container, 0);

    for (let i = 0; i < 80; i++) {
      this.addStar(Math.random() * CONFIG.GAME_HEIGHT);
    }
  }

  private addStar(y?: number): void {
    const g = new Graphics();
    const size = 0.5 + Math.random() * 1.5;
    const alpha = 0.2 + Math.random() * 0.5;
    g.circle(0, 0, size);
    g.fill({ color: 0xffffff, alpha });
    g.x = Math.random() * CONFIG.GAME_WIDTH;
    g.y = y ?? -5;
    this.container.addChild(g);

    this.stars.push({
      graphic: g,
      speed: 0.2 + Math.random() * 0.8,
    });
  }

  update(_world: World, dt: number): void {
    for (let i = this.stars.length - 1; i >= 0; i--) {
      const star = this.stars[i];
      star.graphic.y += star.speed * dt;
      if (star.graphic.y > CONFIG.GAME_HEIGHT + 5) {
        star.graphic.destroy();
        this.stars.splice(i, 1);
        this.addStar();
      }
    }
  }
}
