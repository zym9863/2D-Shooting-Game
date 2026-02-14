import { Container, Text, Graphics } from 'pixi.js';
import type { Application } from 'pixi.js';
import type { Game, Scene } from '../Game';
import { CONFIG } from '../config';
import { GameScene } from './GameScene';

export class TitleScene implements Scene {
  container = new Container();
  private game!: Game;
  private blinkInterval: ReturnType<typeof setInterval> | null = null;
  private handleKey = (e: KeyboardEvent) => {
    if (e.key === 'z' || e.key === 'Z' || e.key === 'Enter') {
      window.removeEventListener('keydown', this.handleKey);
      this.game.switchScene(new GameScene());
    }
  };

  init(_app: Application, game: Game): void {
    this.game = game;

    const bg = new Graphics();
    bg.rect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
    bg.fill({ color: CONFIG.BACKGROUND_COLOR });
    this.container.addChild(bg);

    const title = new Text({
      text: 'NEON BARRAGE',
      style: {
        fontFamily: 'Courier New, monospace',
        fontSize: 36,
        fill: 0x00ffcc,
        letterSpacing: 4,
      },
    });
    title.anchor.set(0.5);
    title.x = CONFIG.GAME_WIDTH / 2;
    title.y = CONFIG.GAME_HEIGHT / 3;
    this.container.addChild(title);

    const sub = new Text({
      text: 'PRESS Z TO START',
      style: {
        fontFamily: 'Courier New, monospace',
        fontSize: 16,
        fill: 0xaaaaaa,
      },
    });
    sub.anchor.set(0.5);
    sub.x = CONFIG.GAME_WIDTH / 2;
    sub.y = CONFIG.GAME_HEIGHT / 2;
    this.container.addChild(sub);

    const controls = new Text({
      text: 'ARROWS/WASD: Move  |  Z: Shoot  |  X: Bomb\nSHIFT: Slow  |  1/2/3: Weapons',
      style: {
        fontFamily: 'Courier New, monospace',
        fontSize: 11,
        fill: 0x666666,
        align: 'center',
      },
    });
    controls.anchor.set(0.5);
    controls.x = CONFIG.GAME_WIDTH / 2;
    controls.y = CONFIG.GAME_HEIGHT * 0.7;
    this.container.addChild(controls);

    let visible = true;
    this.blinkInterval = setInterval(() => {
      visible = !visible;
      sub.alpha = visible ? 1 : 0.3;
    }, 500);

    window.addEventListener('keydown', this.handleKey);
  }

  destroy(): void {
    window.removeEventListener('keydown', this.handleKey);
    if (this.blinkInterval) clearInterval(this.blinkInterval);
    this.container.destroy({ children: true });
  }
}
