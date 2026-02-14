import { Container, Text, Graphics } from 'pixi.js';
import type { Application } from 'pixi.js';
import type { Game, Scene } from '../Game';
import { CONFIG } from '../config';
import { GameScene } from './GameScene';

export class GameOverScene implements Scene {
  container = new Container();
  private game!: Game;
  private score: number;
  private handleKey = (e: KeyboardEvent) => {
    if (e.key === 'z' || e.key === 'Z' || e.key === 'Enter') {
      window.removeEventListener('keydown', this.handleKey);
      this.game.switchScene(new GameScene());
    }
  };

  constructor(score: number) {
    this.score = score;
  }

  init(_app: Application, game: Game): void {
    this.game = game;

    const bg = new Graphics();
    bg.rect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
    bg.fill({ color: CONFIG.BACKGROUND_COLOR, alpha: 0.9 });
    this.container.addChild(bg);

    const title = new Text({
      text: 'GAME OVER',
      style: {
        fontFamily: 'Courier New, monospace',
        fontSize: 36,
        fill: 0xff3366,
        letterSpacing: 4,
      },
    });
    title.anchor.set(0.5);
    title.x = CONFIG.GAME_WIDTH / 2;
    title.y = CONFIG.GAME_HEIGHT / 3;
    this.container.addChild(title);

    const scoreText = new Text({
      text: `SCORE: ${this.score}`,
      style: {
        fontFamily: 'Courier New, monospace',
        fontSize: 20,
        fill: 0xffffff,
      },
    });
    scoreText.anchor.set(0.5);
    scoreText.x = CONFIG.GAME_WIDTH / 2;
    scoreText.y = CONFIG.GAME_HEIGHT / 2;
    this.container.addChild(scoreText);

    const retry = new Text({
      text: 'PRESS Z TO RETRY',
      style: {
        fontFamily: 'Courier New, monospace',
        fontSize: 14,
        fill: 0xaaaaaa,
      },
    });
    retry.anchor.set(0.5);
    retry.x = CONFIG.GAME_WIDTH / 2;
    retry.y = CONFIG.GAME_HEIGHT * 0.65;
    this.container.addChild(retry);

    window.addEventListener('keydown', this.handleKey);
  }

  destroy(): void {
    window.removeEventListener('keydown', this.handleKey);
    this.container.destroy({ children: true });
  }
}
