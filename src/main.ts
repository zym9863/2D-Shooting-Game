import { Application } from 'pixi.js';
import { CONFIG } from './game/config';
import { World } from './ecs';
import { InputSystem } from './systems/InputSystem';
import { PlayerSystem } from './systems/PlayerSystem';
import { MovementSystem } from './systems/MovementSystem';
import { RenderSystem } from './systems/RenderSystem';
import { createPlayer } from './prefabs/createPlayer';

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

  const world = new World();
  const inputSystem = new InputSystem();

  const { entity: playerEntity, container: playerContainer, hitbox } = createPlayer();
  app.stage.addChild(playerContainer);
  world.addEntity(playerEntity);

  world.addSystem(inputSystem);
  world.addSystem(new PlayerSystem(inputSystem, hitbox));
  world.addSystem(new MovementSystem());
  world.addSystem(new RenderSystem());

  app.ticker.add((ticker) => {
    world.update(ticker.deltaTime);
  });
}

bootstrap();
