import { Application, Container } from 'pixi.js';

export interface Scene {
  container: Container;
  init(app: Application, game: Game): void;
  destroy(): void;
}

export class Game {
  app: Application;
  private currentScene: Scene | null = null;

  constructor(app: Application) {
    this.app = app;
  }

  switchScene(scene: Scene): void {
    if (this.currentScene) {
      this.app.stage.removeChild(this.currentScene.container);
      this.currentScene.destroy();
    }
    this.currentScene = scene;
    this.app.stage.addChild(scene.container);
    scene.init(this.app, this);
  }
}
