import { Application } from 'pixi.js';
import { CONFIG } from './game/config';
import { Game } from './game/Game';
import { TitleScene } from './game/scenes/TitleScene';

async function bootstrap() {
  const app = new Application();
  await app.init({
    width: CONFIG.GAME_WIDTH,
    height: CONFIG.GAME_HEIGHT,
    background: CONFIG.BACKGROUND_COLOR,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });
  document.body.appendChild(app.canvas);

  const game = new Game(app);
  game.switchScene(new TitleScene());
}

bootstrap();
