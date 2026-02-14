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
  
  const wrapper = document.getElementById('game-wrapper');
  if (wrapper) {
    wrapper.appendChild(app.canvas);
  }
  
  // Hide loading screen with fade effect
  const loading = document.getElementById('loading');
  if (loading) {
    loading.classList.add('hidden');
    setTimeout(() => loading.remove(), 500);
  }

  const game = new Game(app);
  game.switchScene(new TitleScene());
}

bootstrap();
