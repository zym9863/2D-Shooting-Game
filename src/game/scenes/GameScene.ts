import { Container } from 'pixi.js';
import type { Application } from 'pixi.js';
import type { Game, Scene } from '../Game';
import { CONFIG } from '../config';
import { World } from '@/ecs';
import { PlayerTag, SpriteC, BulletTag, EnemyTag, Health } from '@/components';

import { InputSystem } from '@/systems/InputSystem';
import { PlayerSystem } from '@/systems/PlayerSystem';
import { MovementSystem } from '@/systems/MovementSystem';
import { RenderSystem } from '@/systems/RenderSystem';
import { WeaponSystem } from '@/systems/WeaponSystem';
import { BulletSystem } from '@/systems/BulletSystem';
import { EnemySystem } from '@/systems/EnemySystem';
import { BulletPatternSystem } from '@/systems/BulletPatternSystem';
import { CollisionSystem } from '@/systems/CollisionSystem';
import { DamageSystem } from '@/systems/DamageSystem';
import { PowerUpSystem } from '@/systems/PowerUpSystem';
import { WaveSystem } from '@/systems/WaveSystem';
import { ParticleSystem } from '@/systems/ParticleSystem';
import { BackgroundSystem } from '@/systems/BackgroundSystem';
import { HudSystem } from '@/systems/HudSystem';
import { BossPhaseSystem } from '@/systems/BossPhaseSystem';
import { createPlayer } from '@/prefabs/createPlayer';
import { GameOverScene } from './GameOverScene';
import { GameClearScene } from './GameClearScene';

export class GameScene implements Scene {
  container = new Container();
  private world = new World();
  private game!: Game;
  private tickerFn?: (ticker: any) => void;
  private lives = CONFIG.PLAYER_LIVES;
  private bombHandler?: (e: KeyboardEvent) => void;
  private sceneEnding = false;

  init(app: Application, game: Game): void {
    this.game = game;
    const world = this.world;

    const gameLayer = new Container();
    this.container.addChild(gameLayer);

    // Player
    const inputSystem = new InputSystem();
    const { entity: playerEntity, container: playerContainer, hitbox } = createPlayer();
    gameLayer.addChild(playerContainer);
    world.addEntity(playerEntity);

    // Systems
    const collisionSystem = new CollisionSystem();
    const damageSystem = new DamageSystem(collisionSystem);
    const particleSystem = new ParticleSystem(gameLayer);
    const waveSystem = new WaveSystem(gameLayer);
    const hudSystem = new HudSystem(this.container);

    world.addSystem(new BackgroundSystem(gameLayer));
    world.addSystem(inputSystem);
    world.addSystem(new PlayerSystem(inputSystem, hitbox));
    world.addSystem(new EnemySystem());
    world.addSystem(new BulletPatternSystem(gameLayer));
    world.addSystem(new WeaponSystem(inputSystem, gameLayer));
    world.addSystem(new MovementSystem());
    world.addSystem(collisionSystem);
    world.addSystem(damageSystem);
    world.addSystem(new PowerUpSystem());
    world.addSystem(waveSystem);
    world.addSystem(particleSystem);
    world.addSystem(new BulletSystem());
    world.addSystem(new RenderSystem());
    world.addSystem(hudSystem);

    const bossPhaseSystem = new BossPhaseSystem();
    bossPhaseSystem.onPhaseChange = (_phase: number) => {
      particleSystem.emit(CONFIG.GAME_WIDTH / 2, 100, 0xffffff, 30);
    };
    world.addSystem(bossPhaseSystem);

    // Callbacks
    hudSystem.setLives(this.lives);

    waveSystem.onWaveStart = (wave: number) => {
      hudSystem.showWave(wave);
    };

    waveSystem.onAllWavesComplete = () => {
      if (this.sceneEnding) return;
      this.sceneEnding = true;
      const player = world.queryFirst(PlayerTag);
      const score = player?.getComponent<PlayerTag>(PlayerTag)?.score ?? 0;
      setTimeout(() => {
        game.switchScene(new GameClearScene(score));
      }, 1000);
    };

    damageSystem.onEnemyKilled = (x: number, y: number, score: number) => {
      const player = world.queryFirst(PlayerTag);
      if (player) {
        player.getComponent<PlayerTag>(PlayerTag)!.score += score;
      }
      particleSystem.emit(x, y, 0xff3366, 12);
      waveSystem.spawnPowerUpAt(world, x, y);
    };

    damageSystem.onPlayerDeath = () => {
      this.lives--;
      hudSystem.setLives(this.lives);
      if (this.lives <= 0) {
        if (this.sceneEnding) return;
        this.sceneEnding = true;
        const player = world.queryFirst(PlayerTag);
        const score = player?.getComponent<PlayerTag>(PlayerTag)?.score ?? 0;
        setTimeout(() => {
          game.switchScene(new GameOverScene(score));
        }, 1000);
      }
    };

    // Bomb handler
    this.bombHandler = (e: KeyboardEvent) => {
      if (e.key === 'x' || e.key === 'X') {
        const player = world.queryFirst(PlayerTag);
        if (!player) return;
        const tag = player.getComponent<PlayerTag>(PlayerTag)!;
        if (tag.bombs <= 0) return;
        tag.bombs--;

        // Clear all enemy bullets
        for (const bullet of world.query(BulletTag)) {
          const bt = bullet.getComponent<BulletTag>(BulletTag);
          if (bt && bt.faction === 'enemy') {
            const s = bullet.getComponent<SpriteC>(SpriteC);
            if (s) s.display.destroy();
            world.removeEntity(bullet);
          }
        }
        // Damage all enemies
        for (const enemy of world.query(EnemyTag)) {
          const h = enemy.getComponent<Health>(Health);
          if (h) h.current -= 5;
        }

        particleSystem.emit(CONFIG.GAME_WIDTH / 2, CONFIG.GAME_HEIGHT / 2, 0xffcc00, 40);
      }
    };
    window.addEventListener('keydown', this.bombHandler);

    // Start waves
    waveSystem.start();

    // Game loop
    this.tickerFn = (ticker: any) => {
      world.update(ticker.deltaTime);
    };
    app.ticker.add(this.tickerFn);
  }

  destroy(): void {
    if (this.tickerFn) {
      this.game.app.ticker.remove(this.tickerFn);
    }
    if (this.bombHandler) {
      window.removeEventListener('keydown', this.bombHandler);
    }
    this.world.clear();
    this.container.destroy({ children: true });
  }
}
