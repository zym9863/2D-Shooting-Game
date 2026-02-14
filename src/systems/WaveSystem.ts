import { System, World } from '@/ecs';
import { EnemyTag } from '@/components';
import { WAVES, WaveSpawn } from '@/data/waves';
import { ENEMY_DEFS } from '@/data/enemies';
import { createEnemy } from '@/prefabs/createEnemy';
import { createPowerUp } from '@/prefabs/createPowerUp';
import { randomRange } from '@/utils/math';
import type { PowerUpType } from '@/components';
import type { Container } from 'pixi.js';

export class WaveSystem extends System {
  priority = 75;
  private stage: Container;
  private currentWave = 0;
  private elapsed = 0;
  private spawnTimers: { spawn: WaveSpawn; spawned: number; nextSpawnAt: number }[] = [];
  private waveComplete = false;
  private delayTimer = 0;
  private allWavesComplete = false;
  onWaveStart?: (wave: number) => void;
  onAllWavesComplete?: () => void;

  constructor(stage: Container) {
    super();
    this.stage = stage;
  }

  start(): void {
    this.startWave(0);
  }

  private startWave(index: number): void {
    if (index >= WAVES.length) {
      this.allWavesComplete = true;
      this.onAllWavesComplete?.();
      return;
    }
    this.currentWave = index;
    this.waveComplete = false;
    this.delayTimer = 0;
    const wave = WAVES[index];
    this.spawnTimers = wave.spawns.map((s) => ({
      spawn: s,
      spawned: 0,
      nextSpawnAt: 0,
    }));
    this.onWaveStart?.(index + 1);
  }

  spawnPowerUpAt(world: World, x: number, y: number): void {
    if (Math.random() > 0.25) return;
    const types: PowerUpType[] = ['power', 'shield', 'bomb', 'score'];
    const weights = [0.4, 0.2, 0.15, 0.25];
    let r = Math.random();
    let type: PowerUpType = 'score';
    for (let i = 0; i < types.length; i++) {
      r -= weights[i];
      if (r <= 0) { type = types[i]; break; }
    }
    world.addEntity(createPowerUp(type, x, y, this.stage));
  }

  update(world: World, dt: number): void {
    if (this.allWavesComplete) return;

    this.elapsed += dt * (1000 / 60);

    if (this.waveComplete) {
      this.delayTimer += dt * (1000 / 60);
      const wave = WAVES[this.currentWave];
      const enemiesAlive = world.query(EnemyTag).length;
      if (enemiesAlive === 0 && this.delayTimer >= wave.delayAfter) {
        this.startWave(this.currentWave + 1);
      }
      return;
    }

    let allDone = true;
    for (const timer of this.spawnTimers) {
      if (timer.spawned >= timer.spawn.count) continue;
      allDone = false;

      if (this.elapsed >= timer.nextSpawnAt) {
        const x = randomRange(timer.spawn.xRange[0], timer.spawn.xRange[1]);
        // Boss spawns will be handled later in Task 20-21
        // For now, only spawn regular enemies
        if (!timer.spawn.isBoss) {
          const def = ENEMY_DEFS[timer.spawn.enemyType];
          if (def) {
            world.addEntity(createEnemy(def, x, -20, this.stage));
          }
        }
        timer.spawned++;
        timer.nextSpawnAt = this.elapsed + timer.spawn.interval;
      }
    }

    if (allDone) {
      this.waveComplete = true;
      this.delayTimer = 0;
    }
  }

  getCurrentWave(): number {
    return this.currentWave + 1;
  }
}
