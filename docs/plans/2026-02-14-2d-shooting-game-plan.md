# 2D 弹幕射击游戏实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现一个纵向弹幕射击游戏（STG），霓虹几何视觉风格，ECS 架构。

**Architecture:** 基于 ECS（Entity-Component-System）模式，Entity 为纯 ID + 组件容器，Component 为纯数据，System 执行逻辑。World 管理所有实体和系统的生命周期。子弹和粒子使用对象池复用，碰撞使用空间哈希优化。

**Tech Stack:** TypeScript + PixiJS 8 + Vite，零外部素材，全程序化绘制。

---

### Task 1: 项目脚手架

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.ts`
- Create: `src/game/config.ts`

**Step 1: 初始化项目**

```bash
cd d:/github/2D-Shooting-Game
npm init -y
npm install pixi.js
npm install -D typescript vite
```

**Step 2: 创建 `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"]
}
```

**Step 3: 创建 `vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
  },
});
```

**Step 4: 创建 `index.html`**

```html
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>弹幕射击</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #000; overflow: hidden; display: flex; justify-content: center; align-items: center; height: 100vh; }
    canvas { display: block; }
  </style>
</head>
<body>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

**Step 5: 创建 `src/game/config.ts`**

```ts
export const CONFIG = {
  GAME_WIDTH: 480,
  GAME_HEIGHT: 720,
  BACKGROUND_COLOR: 0x0a0a1a,
  PLAYER_SPEED: 5,
  PLAYER_SLOW_SPEED: 2,
  PLAYER_HITBOX_RADIUS: 3,
  PLAYER_LIVES: 3,
  PLAYER_BOMBS: 3,
  PLAYER_INVINCIBLE_TIME: 2000,
  BULLET_POOL_SIZE: 2000,
  PARTICLE_POOL_SIZE: 500,
  SPATIAL_HASH_CELL_SIZE: 64,
} as const;
```

**Step 6: 创建 `src/main.ts`（最小化启动）**

```ts
import { Application } from 'pixi.js';
import { CONFIG } from './game/config';

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
}

bootstrap();
```

**Step 7: 验证**

```bash
npx vite --open
```

Expected: 浏览器打开，显示 480x720 深色画布。

**Step 8: 提交**

```bash
git add -A
git commit -m "feat: scaffold project with Vite + PixiJS 8 + TypeScript"
```

---

### Task 2: ECS 核心 — Entity 与 Component

**Files:**
- Create: `src/ecs/Component.ts`
- Create: `src/ecs/Entity.ts`

**Step 1: 创建 `src/ecs/Component.ts`**

```ts
export abstract class Component {
  static readonly type: string;
}
```

**Step 2: 创建 `src/ecs/Entity.ts`**

```ts
import { Component } from './Component';

let nextEntityId = 0;

export class Entity {
  readonly id: number;
  private components = new Map<string, Component>();
  alive = true;

  constructor() {
    this.id = nextEntityId++;
  }

  addComponent<T extends Component>(component: T): this {
    const type = (component.constructor as typeof Component).type;
    this.components.set(type, component);
    return this;
  }

  getComponent<T extends Component>(ctor: { type: string }): T | undefined {
    return this.components.get(ctor.type) as T | undefined;
  }

  hasComponent(ctor: { type: string }): boolean {
    return this.components.has(ctor.type);
  }

  removeComponent(ctor: { type: string }): void {
    this.components.delete(ctor.type);
  }

  hasAll(...ctors: { type: string }[]): boolean {
    return ctors.every((c) => this.components.has(c.type));
  }
}
```

**Step 3: 提交**

```bash
git add src/ecs/
git commit -m "feat: add ECS Entity and Component base classes"
```

---

### Task 3: ECS 核心 — System 与 World

**Files:**
- Create: `src/ecs/System.ts`
- Create: `src/ecs/World.ts`
- Create: `src/ecs/index.ts`

**Step 1: 创建 `src/ecs/System.ts`**

```ts
import type { World } from './World';

export abstract class System {
  priority = 0;
  abstract update(world: World, dt: number): void;
}
```

**Step 2: 创建 `src/ecs/World.ts`**

```ts
import { Entity } from './Entity';
import { System } from './System';
import type { Component } from './Component';

export class World {
  private entities: Entity[] = [];
  private systems: System[] = [];
  private entitiesToAdd: Entity[] = [];
  private entitiesToRemove: Set<number> = new Set();

  addEntity(entity: Entity): Entity {
    this.entitiesToAdd.push(entity);
    return entity;
  }

  removeEntity(entity: Entity): void {
    entity.alive = false;
    this.entitiesToRemove.add(entity.id);
  }

  addSystem(system: System): void {
    this.systems.push(system);
    this.systems.sort((a, b) => a.priority - b.priority);
  }

  query(...componentTypes: { type: string }[]): Entity[] {
    return this.entities.filter(
      (e) => e.alive && e.hasAll(...componentTypes)
    );
  }

  queryFirst(...componentTypes: { type: string }[]): Entity | undefined {
    return this.entities.find(
      (e) => e.alive && e.hasAll(...componentTypes)
    );
  }

  update(dt: number): void {
    // flush pending additions
    if (this.entitiesToAdd.length > 0) {
      this.entities.push(...this.entitiesToAdd);
      this.entitiesToAdd.length = 0;
    }

    // run systems
    for (const system of this.systems) {
      system.update(this, dt);
    }

    // flush pending removals
    if (this.entitiesToRemove.size > 0) {
      this.entities = this.entities.filter(
        (e) => !this.entitiesToRemove.has(e.id)
      );
      this.entitiesToRemove.clear();
    }
  }

  getEntities(): readonly Entity[] {
    return this.entities;
  }

  clear(): void {
    this.entities.length = 0;
    this.entitiesToAdd.length = 0;
    this.entitiesToRemove.clear();
  }
}
```

**Step 3: 创建 `src/ecs/index.ts`**

```ts
export { Component } from './Component';
export { Entity } from './Entity';
export { System } from './System';
export { World } from './World';
```

**Step 4: 提交**

```bash
git add src/ecs/
git commit -m "feat: add ECS System, World, and index barrel"
```

---

### Task 4: 工具类 — 数学、对象池、空间哈希

**Files:**
- Create: `src/utils/math.ts`
- Create: `src/utils/pool.ts`
- Create: `src/utils/spatial-hash.ts`

**Step 1: 创建 `src/utils/math.ts`**

```ts
export function angleBetween(x1: number, y1: number, x2: number, y2: number): number {
  return Math.atan2(y2 - y1, x2 - x1);
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export const TAU = Math.PI * 2;
```

**Step 2: 创建 `src/utils/pool.ts`**

```ts
export class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;

  constructor(factory: () => T, reset: (obj: T) => void, initialSize = 0) {
    this.factory = factory;
    this.reset = reset;
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory());
    }
  }

  acquire(): T {
    if (this.pool.length > 0) {
      const obj = this.pool.pop()!;
      this.reset(obj);
      return obj;
    }
    return this.factory();
  }

  release(obj: T): void {
    this.pool.push(obj);
  }

  get size(): number {
    return this.pool.length;
  }
}
```

**Step 3: 创建 `src/utils/spatial-hash.ts`**

```ts
import { Entity } from '@/ecs';

export class SpatialHash {
  private cellSize: number;
  private cells = new Map<string, Entity[]>();

  constructor(cellSize: number) {
    this.cellSize = cellSize;
  }

  private key(cx: number, cy: number): string {
    return `${cx},${cy}`;
  }

  clear(): void {
    this.cells.clear();
  }

  insert(entity: Entity, x: number, y: number, radius: number): void {
    const minCx = Math.floor((x - radius) / this.cellSize);
    const maxCx = Math.floor((x + radius) / this.cellSize);
    const minCy = Math.floor((y - radius) / this.cellSize);
    const maxCy = Math.floor((y + radius) / this.cellSize);

    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        const k = this.key(cx, cy);
        let cell = this.cells.get(k);
        if (!cell) {
          cell = [];
          this.cells.set(k, cell);
        }
        cell.push(entity);
      }
    }
  }

  query(x: number, y: number, radius: number): Entity[] {
    const result: Entity[] = [];
    const seen = new Set<number>();
    const minCx = Math.floor((x - radius) / this.cellSize);
    const maxCx = Math.floor((x + radius) / this.cellSize);
    const minCy = Math.floor((y - radius) / this.cellSize);
    const maxCy = Math.floor((y + radius) / this.cellSize);

    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        const cell = this.cells.get(this.key(cx, cy));
        if (cell) {
          for (const entity of cell) {
            if (!seen.has(entity.id)) {
              seen.add(entity.id);
              result.push(entity);
            }
          }
        }
      }
    }
    return result;
  }
}
```

**Step 4: 提交**

```bash
git add src/utils/
git commit -m "feat: add math utils, object pool, and spatial hash"
```

---

### Task 5: 所有 Component 定义

**Files:**
- Create: `src/components/Transform.ts`
- Create: `src/components/Velocity.ts`
- Create: `src/components/Health.ts`
- Create: `src/components/Collider.ts`
- Create: `src/components/SpriteC.ts`
- Create: `src/components/PlayerTag.ts`
- Create: `src/components/EnemyTag.ts`
- Create: `src/components/BulletTag.ts`
- Create: `src/components/BulletPattern.ts`
- Create: `src/components/Weapon.ts`
- Create: `src/components/PowerUpC.ts`
- Create: `src/components/index.ts`

**Step 1: 创建所有组件文件**

`src/components/Transform.ts`:
```ts
import { Component } from '@/ecs';

export class Transform extends Component {
  static readonly type = 'Transform';
  constructor(
    public x = 0,
    public y = 0,
    public rotation = 0,
    public scaleX = 1,
    public scaleY = 1,
  ) { super(); }
}
```

`src/components/Velocity.ts`:
```ts
import { Component } from '@/ecs';

export class Velocity extends Component {
  static readonly type = 'Velocity';
  constructor(
    public vx = 0,
    public vy = 0,
    public angularVelocity = 0,
  ) { super(); }
}
```

`src/components/Health.ts`:
```ts
import { Component } from '@/ecs';

export class Health extends Component {
  static readonly type = 'Health';
  invincibleTimer = 0;
  constructor(
    public current: number,
    public max: number,
  ) { super(); }
}
```

`src/components/Collider.ts`:
```ts
import { Component } from '@/ecs';

export type ColliderLayer = 'player' | 'playerBullet' | 'enemy' | 'enemyBullet' | 'powerUp';

export class Collider extends Component {
  static readonly type = 'Collider';
  constructor(
    public radius: number,
    public layer: ColliderLayer,
  ) { super(); }
}
```

`src/components/SpriteC.ts`:
```ts
import { Component } from '@/ecs';
import type { Container } from 'pixi.js';

export class SpriteC extends Component {
  static readonly type = 'SpriteC';
  constructor(public display: Container) { super(); }
}
```

`src/components/PlayerTag.ts`:
```ts
import { Component } from '@/ecs';

export class PlayerTag extends Component {
  static readonly type = 'PlayerTag';
  bombs = 3;
  score = 0;
  slowMode = false;
  shieldActive = false;
}
```

`src/components/EnemyTag.ts`:
```ts
import { Component } from '@/ecs';

export type EnemyType = 'diamond' | 'hexagon' | 'square' | 'miniBoss' | 'finalBoss';

export class EnemyTag extends Component {
  static readonly type = 'EnemyTag';
  scoreValue = 100;
  constructor(public enemyType: EnemyType) { super(); }
}
```

`src/components/BulletTag.ts`:
```ts
import { Component } from '@/ecs';

export type Faction = 'player' | 'enemy';

export class BulletTag extends Component {
  static readonly type = 'BulletTag';
  constructor(
    public faction: Faction,
    public damage = 1,
    public piercing = false,
  ) { super(); }
}
```

`src/components/BulletPattern.ts`:
```ts
import { Component } from '@/ecs';

export type PatternType = 'fan' | 'ring' | 'spiral' | 'aimed' | 'random';

export interface PatternParams {
  bulletCount: number;
  speed: number;
  spreadAngle?: number;
  rotationOffset?: number;
  rotationSpeed?: number;
  arms?: number;
  bulletInterval?: number;
  angleRange?: number;
  speedRange?: [number, number];
  fireRate: number;
}

export class BulletPattern extends Component {
  static readonly type = 'BulletPattern';
  elapsed = 0;
  currentAngle = 0;
  constructor(
    public patternType: PatternType,
    public params: PatternParams,
  ) { super(); }
}
```

`src/components/Weapon.ts`:
```ts
import { Component } from '@/ecs';

export type WeaponType = 'vulcan' | 'spread' | 'laser';

export class Weapon extends Component {
  static readonly type = 'Weapon';
  lastFiredAt = 0;
  constructor(
    public weaponType: WeaponType = 'vulcan',
    public level = 1,
    public fireRate = 100,
  ) { super(); }
}
```

`src/components/PowerUpC.ts`:
```ts
import { Component } from '@/ecs';

export type PowerUpType = 'power' | 'shield' | 'bomb' | 'score';

export class PowerUpC extends Component {
  static readonly type = 'PowerUpC';
  constructor(public powerUpType: PowerUpType) { super(); }
}
```

`src/components/index.ts`:
```ts
export { Transform } from './Transform';
export { Velocity } from './Velocity';
export { Health } from './Health';
export { Collider } from './Collider';
export type { ColliderLayer } from './Collider';
export { SpriteC } from './SpriteC';
export { PlayerTag } from './PlayerTag';
export { EnemyTag } from './EnemyTag';
export type { EnemyType } from './EnemyTag';
export { BulletTag } from './BulletTag';
export type { Faction } from './BulletTag';
export { BulletPattern } from './BulletPattern';
export type { PatternType, PatternParams } from './BulletPattern';
export { Weapon } from './Weapon';
export type { WeaponType } from './Weapon';
export { PowerUpC } from './PowerUpC';
export type { PowerUpType } from './PowerUpC';
```

**Step 2: 提交**

```bash
git add src/components/
git commit -m "feat: add all ECS component definitions"
```

---

### Task 6: 输入系统

**Files:**
- Create: `src/systems/InputSystem.ts`

**Step 1: 创建 `src/systems/InputSystem.ts`**

```ts
import { System } from '@/ecs';
import type { World } from '@/ecs';

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  shoot: boolean;
  slow: boolean;
  bomb: boolean;
  weapon1: boolean;
  weapon2: boolean;
  weapon3: boolean;
}

export class InputSystem extends System {
  priority = 0;
  readonly state: InputState = {
    up: false, down: false, left: false, right: false,
    shoot: false, slow: false, bomb: false,
    weapon1: false, weapon2: false, weapon3: false,
  };
  private keyMap: Record<string, keyof InputState> = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', s: 'down', a: 'left', d: 'right',
    z: 'shoot', Z: 'shoot',
    x: 'bomb', X: 'bomb',
    Shift: 'slow',
    '1': 'weapon1', '2': 'weapon2', '3': 'weapon3',
  };

  constructor() {
    super();
    window.addEventListener('keydown', (e) => {
      const action = this.keyMap[e.key];
      if (action) {
        this.state[action] = true;
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', (e) => {
      const action = this.keyMap[e.key];
      if (action) {
        this.state[action] = false;
      }
    });
  }

  update(_world: World, _dt: number): void {
    // state is updated via event listeners
  }
}
```

**Step 2: 提交**

```bash
git add src/systems/InputSystem.ts
git commit -m "feat: add keyboard input system"
```

---

### Task 7: 程序化绘制工厂 + 玩家预制件

**Files:**
- Create: `src/prefabs/drawShapes.ts`
- Create: `src/prefabs/createPlayer.ts`

**Step 1: 创建 `src/prefabs/drawShapes.ts`**

```ts
import { Graphics, Container, BlurFilter } from 'pixi.js';

export function drawPlayerShip(): Container {
  const container = new Container();

  // 主体三角形
  const body = new Graphics();
  body.poly([0, -18, -12, 14, 12, 14]);
  body.fill({ color: 0x00ffcc, alpha: 0.15 });
  body.stroke({ color: 0x00ffcc, width: 2 });
  container.addChild(body);

  // 辉光层
  const glow = new Graphics();
  glow.poly([0, -18, -12, 14, 12, 14]);
  glow.stroke({ color: 0x00ffcc, width: 4, alpha: 0.4 });
  glow.filters = [new BlurFilter({ strength: 6, quality: 2 })];
  container.addChildAt(glow, 0);

  return container;
}

export function drawHitbox(): Graphics {
  const g = new Graphics();
  g.circle(0, 0, 3);
  g.fill({ color: 0xffffff, alpha: 0.9 });
  g.visible = false;
  return g;
}

export function drawEnemyDiamond(): Container {
  const container = new Container();
  const body = new Graphics();
  body.poly([0, -14, 12, 0, 0, 14, -12, 0]);
  body.fill({ color: 0xff3366, alpha: 0.2 });
  body.stroke({ color: 0xff3366, width: 2 });
  container.addChild(body);
  return container;
}

export function drawEnemyHexagon(): Container {
  const container = new Container();
  const body = new Graphics();
  const r = 14;
  const points: number[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    points.push(Math.cos(angle) * r, Math.sin(angle) * r);
  }
  body.poly(points);
  body.fill({ color: 0xff8800, alpha: 0.2 });
  body.stroke({ color: 0xff8800, width: 2 });
  container.addChild(body);
  return container;
}

export function drawEnemySquare(): Container {
  const container = new Container();
  const body = new Graphics();
  body.rect(-10, -10, 20, 20);
  body.fill({ color: 0xaa44ff, alpha: 0.2 });
  body.stroke({ color: 0xaa44ff, width: 2 });
  container.addChild(body);
  return container;
}

export function drawBullet(color: number, radius: number): Graphics {
  const g = new Graphics();
  g.circle(0, 0, radius);
  g.fill({ color, alpha: 0.9 });
  return g;
}

export function drawPowerUp(color: number): Container {
  const container = new Container();
  const body = new Graphics();
  body.circle(0, 0, 8);
  body.fill({ color, alpha: 0.4 });
  body.stroke({ color, width: 2 });
  container.addChild(body);

  const glow = new Graphics();
  glow.circle(0, 0, 8);
  glow.stroke({ color, width: 3, alpha: 0.3 });
  glow.filters = [new BlurFilter({ strength: 4, quality: 2 })];
  container.addChildAt(glow, 0);

  return container;
}
```

**Step 2: 创建 `src/prefabs/createPlayer.ts`**

```ts
import { Entity } from '@/ecs';
import { Transform, Velocity, Health, Collider, SpriteC, PlayerTag, Weapon } from '@/components';
import { drawPlayerShip, drawHitbox } from './drawShapes';
import { CONFIG } from '@/game/config';
import { Container } from 'pixi.js';

export function createPlayer(): { entity: Entity; container: Container; hitbox: import('pixi.js').Graphics } {
  const container = new Container();
  const ship = drawPlayerShip();
  const hitbox = drawHitbox();
  container.addChild(ship);
  container.addChild(hitbox);

  const entity = new Entity();
  entity
    .addComponent(new Transform(CONFIG.GAME_WIDTH / 2, CONFIG.GAME_HEIGHT - 80))
    .addComponent(new Velocity())
    .addComponent(new Health(1, 1))
    .addComponent(new Collider(CONFIG.PLAYER_HITBOX_RADIUS, 'player'))
    .addComponent(new SpriteC(container))
    .addComponent(new PlayerTag())
    .addComponent(new Weapon('vulcan', 1, 100));

  return { entity, container, hitbox };
}
```

**Step 3: 提交**

```bash
git add src/prefabs/
git commit -m "feat: add shape drawing utils and player prefab"
```

---

### Task 8: PlayerSystem + MovementSystem + RenderSystem（可操作的玩家）

**Files:**
- Create: `src/systems/PlayerSystem.ts`
- Create: `src/systems/MovementSystem.ts`
- Create: `src/systems/RenderSystem.ts`

**Step 1: 创建 `src/systems/PlayerSystem.ts`**

```ts
import { System, World } from '@/ecs';
import { Transform, Velocity, PlayerTag, Weapon } from '@/components';
import { InputSystem } from './InputSystem';
import { CONFIG } from '@/game/config';
import { clamp } from '@/utils/math';
import type { Graphics } from 'pixi.js';

export class PlayerSystem extends System {
  priority = 10;
  private input: InputSystem;
  private hitbox: Graphics | null = null;

  constructor(input: InputSystem, hitbox?: Graphics) {
    super();
    this.input = input;
    this.hitbox = hitbox ?? null;
  }

  update(world: World, _dt: number): void {
    const player = world.queryFirst(PlayerTag, Transform, Velocity);
    if (!player) return;

    const tag = player.getComponent<PlayerTag>(PlayerTag)!;
    const transform = player.getComponent<Transform>(Transform)!;
    const velocity = player.getComponent<Velocity>(Velocity)!;
    const weapon = player.getComponent<Weapon>(Weapon);

    // slow mode
    tag.slowMode = this.input.state.slow;
    if (this.hitbox) this.hitbox.visible = tag.slowMode;

    const speed = tag.slowMode ? CONFIG.PLAYER_SLOW_SPEED : CONFIG.PLAYER_SPEED;
    let vx = 0, vy = 0;
    if (this.input.state.left) vx -= 1;
    if (this.input.state.right) vx += 1;
    if (this.input.state.up) vy -= 1;
    if (this.input.state.down) vy += 1;

    // normalize diagonal
    if (vx !== 0 && vy !== 0) {
      const inv = 1 / Math.SQRT2;
      vx *= inv;
      vy *= inv;
    }
    velocity.vx = vx * speed;
    velocity.vy = vy * speed;

    // clamp to bounds (applied after movement)
    transform.x = clamp(transform.x, 16, CONFIG.GAME_WIDTH - 16);
    transform.y = clamp(transform.y, 16, CONFIG.GAME_HEIGHT - 16);

    // weapon switch
    if (weapon) {
      if (this.input.state.weapon1) { weapon.weaponType = 'vulcan'; weapon.fireRate = 100; }
      if (this.input.state.weapon2) { weapon.weaponType = 'spread'; weapon.fireRate = 200; }
      if (this.input.state.weapon3) { weapon.weaponType = 'laser'; weapon.fireRate = 50; }
    }
  }
}
```

**Step 2: 创建 `src/systems/MovementSystem.ts`**

```ts
import { System, World } from '@/ecs';
import { Transform, Velocity } from '@/components';

export class MovementSystem extends System {
  priority = 50;

  update(world: World, dt: number): void {
    for (const entity of world.query(Transform, Velocity)) {
      const t = entity.getComponent<Transform>(Transform)!;
      const v = entity.getComponent<Velocity>(Velocity)!;
      t.x += v.vx * dt;
      t.y += v.vy * dt;
      t.rotation += v.angularVelocity * dt;
    }
  }
}
```

**Step 3: 创建 `src/systems/RenderSystem.ts`**

```ts
import { System, World } from '@/ecs';
import { Transform, SpriteC } from '@/components';

export class RenderSystem extends System {
  priority = 100;

  update(world: World, _dt: number): void {
    for (const entity of world.query(Transform, SpriteC)) {
      const t = entity.getComponent<Transform>(Transform)!;
      const s = entity.getComponent<SpriteC>(SpriteC)!;
      s.display.x = t.x;
      s.display.y = t.y;
      s.display.rotation = t.rotation;
      s.display.scale.set(t.scaleX, t.scaleY);
    }
  }
}
```

**Step 4: 更新 `src/main.ts` 集成玩家**

```ts
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

  // input
  const inputSystem = new InputSystem();

  // player
  const { entity: playerEntity, container: playerContainer, hitbox } = createPlayer();
  app.stage.addChild(playerContainer);
  world.addEntity(playerEntity);

  // systems
  world.addSystem(inputSystem);
  world.addSystem(new PlayerSystem(inputSystem, hitbox));
  world.addSystem(new MovementSystem());
  world.addSystem(new RenderSystem());

  // game loop
  app.ticker.add((ticker) => {
    world.update(ticker.deltaTime);
  });
}

bootstrap();
```

**Step 5: 运行验证**

```bash
npx vite --open
```

Expected: 看到霓虹青色三角形，方向键/WASD 移动，Shift 切换低速模式显示判定点。

**Step 6: 提交**

```bash
git add src/
git commit -m "feat: add player, movement, render systems — playable character"
```

---

### Task 9: 子弹系统 + 武器系统（玩家射击）

**Files:**
- Create: `src/prefabs/createBullet.ts`
- Create: `src/systems/WeaponSystem.ts`
- Create: `src/systems/BulletSystem.ts`

**Step 1: 创建 `src/prefabs/createBullet.ts`**

```ts
import { Entity } from '@/ecs';
import { Transform, Velocity, BulletTag, SpriteC, Collider } from '@/components';
import { drawBullet } from './drawShapes';
import type { Faction } from '@/components';
import type { Container } from 'pixi.js';

export function createBullet(
  x: number, y: number,
  vx: number, vy: number,
  faction: Faction,
  damage: number,
  color: number,
  radius: number,
  stage: Container,
): Entity {
  const graphic = drawBullet(color, radius);
  stage.addChild(graphic);

  const entity = new Entity();
  entity
    .addComponent(new Transform(x, y))
    .addComponent(new Velocity(vx, vy))
    .addComponent(new BulletTag(faction, damage))
    .addComponent(new Collider(radius, faction === 'player' ? 'playerBullet' : 'enemyBullet'))
    .addComponent(new SpriteC(graphic));
  return entity;
}
```

**Step 2: 创建 `src/systems/WeaponSystem.ts`**

```ts
import { System, World } from '@/ecs';
import { Transform, PlayerTag, Weapon } from '@/components';
import { InputSystem } from './InputSystem';
import { createBullet } from '@/prefabs/createBullet';
import type { Container } from 'pixi.js';
import { TAU } from '@/utils/math';

export class WeaponSystem extends System {
  priority = 40;
  private input: InputSystem;
  private stage: Container;
  private elapsed = 0;

  constructor(input: InputSystem, stage: Container) {
    super();
    this.input = input;
    this.stage = stage;
  }

  update(world: World, dt: number): void {
    this.elapsed += dt * (1000 / 60); // convert to ms approx

    const player = world.queryFirst(PlayerTag, Transform, Weapon);
    if (!player) return;
    if (!this.input.state.shoot) return;

    const t = player.getComponent<Transform>(Transform)!;
    const w = player.getComponent<Weapon>(Weapon)!;

    if (this.elapsed - w.lastFiredAt < w.fireRate) return;
    w.lastFiredAt = this.elapsed;

    const x = t.x;
    const y = t.y;

    switch (w.weaponType) {
      case 'vulcan':
        this.fireVulcan(world, x, y, w.level);
        break;
      case 'spread':
        this.fireSpread(world, x, y, w.level);
        break;
      case 'laser':
        this.fireLaser(world, x, y, w.level);
        break;
    }
  }

  private fireVulcan(world: World, x: number, y: number, level: number): void {
    const speed = -10;
    const damage = level;
    world.addEntity(createBullet(x, y - 10, 0, speed, 'player', damage, 0x00ffcc, 3, this.stage));
    if (level >= 2) {
      world.addEntity(createBullet(x - 8, y - 6, 0, speed, 'player', damage, 0x00ffcc, 3, this.stage));
      world.addEntity(createBullet(x + 8, y - 6, 0, speed, 'player', damage, 0x00ffcc, 3, this.stage));
    }
    if (level >= 3) {
      world.addEntity(createBullet(x - 14, y - 2, -0.5, speed, 'player', damage, 0x00ffcc, 3, this.stage));
      world.addEntity(createBullet(x + 14, y - 2, 0.5, speed, 'player', damage, 0x00ffcc, 3, this.stage));
    }
  }

  private fireSpread(world: World, x: number, y: number, level: number): void {
    const speed = 9;
    const damage = Math.max(1, level - 1) || 1;
    const count = 2 + level;
    const totalAngle = (Math.PI / 6) * level;
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 - totalAngle / 2 + (totalAngle / (count - 1)) * i;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      world.addEntity(createBullet(x, y - 10, vx, vy, 'player', damage, 0x44ff88, 3, this.stage));
    }
  }

  private fireLaser(world: World, x: number, y: number, level: number): void {
    const speed = -14;
    const damage = level * 0.5;
    world.addEntity(createBullet(x, y - 10, 0, speed, 'player', damage, 0x88ccff, 2, this.stage));
  }
}
```

**Step 3: 创建 `src/systems/BulletSystem.ts`**

```ts
import { System, World } from '@/ecs';
import { Transform, BulletTag, SpriteC } from '@/components';
import { CONFIG } from '@/game/config';

export class BulletSystem extends System {
  priority = 55;

  update(world: World, _dt: number): void {
    const margin = 40;
    for (const entity of world.query(BulletTag, Transform)) {
      const t = entity.getComponent<Transform>(Transform)!;
      // remove off-screen bullets
      if (t.x < -margin || t.x > CONFIG.GAME_WIDTH + margin ||
          t.y < -margin || t.y > CONFIG.GAME_HEIGHT + margin) {
        const sprite = entity.getComponent<SpriteC>(SpriteC);
        if (sprite) sprite.display.destroy();
        world.removeEntity(entity);
      }
    }
  }
}
```

**Step 4: 更新 `src/main.ts` — 添加武器和子弹系统**

在 systems 注册部分添加：

```ts
import { WeaponSystem } from './systems/WeaponSystem';
import { BulletSystem } from './systems/BulletSystem';

// ... 在 world.addSystem 部分添加
world.addSystem(new WeaponSystem(inputSystem, app.stage));
world.addSystem(new BulletSystem());
```

**Step 5: 验证**

Expected: 按住 Z 键发射青色子弹，按 1/2/3 切换武器类型。

**Step 6: 提交**

```bash
git add src/
git commit -m "feat: add weapon and bullet systems — player can shoot"
```

---

### Task 10: 敌人预制件 + 敌人系统

**Files:**
- Create: `src/prefabs/createEnemy.ts`
- Create: `src/systems/EnemySystem.ts`
- Create: `src/data/enemies.ts`

**Step 1: 创建 `src/data/enemies.ts`**

```ts
import type { EnemyType } from '@/components';
import type { PatternType, PatternParams } from '@/components';

export interface EnemyDef {
  type: EnemyType;
  health: number;
  speed: number;
  score: number;
  pattern: { type: PatternType; params: PatternParams };
}

export const ENEMY_DEFS: Record<string, EnemyDef> = {
  diamond: {
    type: 'diamond',
    health: 3,
    speed: 1.5,
    score: 100,
    pattern: {
      type: 'fan',
      params: { bulletCount: 3, spreadAngle: Math.PI / 4, speed: 3, fireRate: 1200 },
    },
  },
  hexagon: {
    type: 'hexagon',
    health: 5,
    speed: 1,
    score: 200,
    pattern: {
      type: 'ring',
      params: { bulletCount: 8, speed: 2.5, rotationOffset: 0, fireRate: 1500 },
    },
  },
  square: {
    type: 'square',
    health: 4,
    speed: 1.2,
    score: 150,
    pattern: {
      type: 'aimed',
      params: { bulletCount: 2, spreadAngle: Math.PI / 8, speed: 4, fireRate: 1000 },
    },
  },
};
```

**Step 2: 创建 `src/prefabs/createEnemy.ts`**

```ts
import { Entity } from '@/ecs';
import { Transform, Velocity, Health, Collider, SpriteC, EnemyTag, BulletPattern } from '@/components';
import { drawEnemyDiamond, drawEnemyHexagon, drawEnemySquare } from './drawShapes';
import type { EnemyDef } from '@/data/enemies';
import type { Container } from 'pixi.js';

const DRAW_MAP: Record<string, () => Container> = {
  diamond: drawEnemyDiamond,
  hexagon: drawEnemyHexagon,
  square: drawEnemySquare,
};

export function createEnemy(def: EnemyDef, x: number, y: number, stage: Container): Entity {
  const drawFn = DRAW_MAP[def.type] ?? drawEnemyDiamond;
  const display = drawFn();
  stage.addChild(display);

  const entity = new Entity();
  entity
    .addComponent(new Transform(x, y))
    .addComponent(new Velocity(0, def.speed))
    .addComponent(new Health(def.health, def.health))
    .addComponent(new Collider(14, 'enemy'))
    .addComponent(new SpriteC(display))
    .addComponent(new EnemyTag(def.type))
    .addComponent(new BulletPattern(def.pattern.type, { ...def.pattern.params }));

  const tag = entity.getComponent<EnemyTag>(EnemyTag)!;
  tag.scoreValue = def.score;

  return entity;
}
```

**Step 3: 创建 `src/systems/EnemySystem.ts`**

```ts
import { System, World } from '@/ecs';
import { Transform, EnemyTag, SpriteC } from '@/components';
import { CONFIG } from '@/game/config';

export class EnemySystem extends System {
  priority = 20;

  update(world: World, _dt: number): void {
    for (const entity of world.query(EnemyTag, Transform)) {
      const t = entity.getComponent<Transform>(Transform)!;
      // remove off-screen enemies (passed bottom)
      if (t.y > CONFIG.GAME_HEIGHT + 60) {
        const sprite = entity.getComponent<SpriteC>(SpriteC);
        if (sprite) sprite.display.destroy();
        world.removeEntity(entity);
      }
    }
  }
}
```

**Step 4: 提交**

```bash
git add src/
git commit -m "feat: add enemy definitions, prefab factory, and enemy system"
```

---

### Task 11: 弹幕模式系统

**Files:**
- Create: `src/systems/BulletPatternSystem.ts`

**Step 1: 创建 `src/systems/BulletPatternSystem.ts`**

```ts
import { System, World } from '@/ecs';
import { Transform, BulletPattern, EnemyTag, PlayerTag } from '@/components';
import { createBullet } from '@/prefabs/createBullet';
import { angleBetween, TAU, randomRange } from '@/utils/math';
import type { Container } from 'pixi.js';

export class BulletPatternSystem extends System {
  priority = 30;
  private stage: Container;

  constructor(stage: Container) {
    super();
    this.stage = stage;
  }

  update(world: World, dt: number): void {
    const player = world.queryFirst(PlayerTag, Transform);
    const playerT = player?.getComponent<Transform>(Transform);

    for (const entity of world.query(EnemyTag, Transform, BulletPattern)) {
      const t = entity.getComponent<Transform>(Transform)!;
      const bp = entity.getComponent<BulletPattern>(BulletPattern)!;
      bp.elapsed += dt * (1000 / 60);

      if (bp.elapsed - bp.currentAngle < bp.params.fireRate) continue;
      bp.currentAngle = bp.elapsed;

      const { patternType, params } = bp;
      switch (patternType) {
        case 'fan':
          this.fireFan(world, t.x, t.y, params.bulletCount, params.spreadAngle ?? Math.PI / 4, params.speed, playerT);
          break;
        case 'ring':
          this.fireRing(world, t.x, t.y, params.bulletCount, params.speed, params.rotationOffset ?? 0);
          bp.params.rotationOffset = (bp.params.rotationOffset ?? 0) + 0.15;
          break;
        case 'spiral':
          this.fireSpiral(world, t.x, t.y, bp);
          break;
        case 'aimed':
          this.fireAimed(world, t.x, t.y, params.bulletCount, params.spreadAngle ?? 0, params.speed, playerT);
          break;
        case 'random':
          this.fireRandom(world, t.x, t.y, params.bulletCount, params.speed);
          break;
      }
    }
  }

  private fireFan(world: World, x: number, y: number, count: number, spread: number, speed: number, playerT?: Transform): void {
    const baseAngle = playerT ? angleBetween(x, y, playerT.x, playerT.y) : Math.PI / 2;
    for (let i = 0; i < count; i++) {
      const angle = baseAngle - spread / 2 + (spread / (count - 1 || 1)) * i;
      world.addEntity(createBullet(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, 'enemy', 1, 0xff66aa, 5, this.stage));
    }
  }

  private fireRing(world: World, x: number, y: number, count: number, speed: number, offset: number): void {
    for (let i = 0; i < count; i++) {
      const angle = offset + (TAU / count) * i;
      world.addEntity(createBullet(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, 'enemy', 1, 0xcc66ff, 4, this.stage));
    }
  }

  private fireSpiral(world: World, x: number, y: number, bp: BulletPattern): void {
    const arms = bp.params.arms ?? 3;
    const speed = bp.params.speed;
    const rotSpeed = bp.params.rotationSpeed ?? 0.1;
    bp.params.rotationOffset = (bp.params.rotationOffset ?? 0) + rotSpeed;
    const offset = bp.params.rotationOffset;
    for (let i = 0; i < arms; i++) {
      const angle = offset + (TAU / arms) * i;
      world.addEntity(createBullet(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, 'enemy', 1, 0xff8844, 4, this.stage));
    }
  }

  private fireAimed(world: World, x: number, y: number, count: number, spread: number, speed: number, playerT?: Transform): void {
    const baseAngle = playerT ? angleBetween(x, y, playerT.x, playerT.y) : Math.PI / 2;
    if (count === 1) {
      world.addEntity(createBullet(x, y, Math.cos(baseAngle) * speed, Math.sin(baseAngle) * speed, 'enemy', 1, 0xff4444, 5, this.stage));
    } else {
      for (let i = 0; i < count; i++) {
        const angle = baseAngle - spread / 2 + (spread / (count - 1)) * i;
        world.addEntity(createBullet(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, 'enemy', 1, 0xff4444, 5, this.stage));
      }
    }
  }

  private fireRandom(world: World, x: number, y: number, count: number, speed: number): void {
    for (let i = 0; i < count; i++) {
      const angle = randomRange(0, TAU);
      const s = randomRange(speed * 0.6, speed * 1.4);
      world.addEntity(createBullet(x, y, Math.cos(angle) * s, Math.sin(angle) * s, 'enemy', 1, 0xffaa44, 4, this.stage));
    }
  }
}
```

**Step 2: 提交**

```bash
git add src/systems/BulletPatternSystem.ts
git commit -m "feat: add bullet pattern system with 5 pattern types"
```

---

### Task 12: 碰撞系统 + 伤害系统

**Files:**
- Create: `src/systems/CollisionSystem.ts`
- Create: `src/systems/DamageSystem.ts`

**Step 1: 创建 `src/systems/CollisionSystem.ts`**

```ts
import { System, World, Entity } from '@/ecs';
import { Transform, Collider, BulletTag, PlayerTag, EnemyTag, PowerUpC } from '@/components';
import { SpatialHash } from '@/utils/spatial-hash';
import { distance } from '@/utils/math';
import { CONFIG } from '@/game/config';

export interface CollisionEvent {
  entityA: Entity;
  entityB: Entity;
  type: 'playerBullet_enemy' | 'enemyBullet_player' | 'player_powerUp' | 'player_enemy';
}

export class CollisionSystem extends System {
  priority = 60;
  readonly events: CollisionEvent[] = [];
  private hash = new SpatialHash(CONFIG.SPATIAL_HASH_CELL_SIZE);

  update(world: World, _dt: number): void {
    this.events.length = 0;
    this.hash.clear();

    const collidables = world.query(Transform, Collider);
    for (const entity of collidables) {
      const t = entity.getComponent<Transform>(Transform)!;
      const c = entity.getComponent<Collider>(Collider)!;
      this.hash.insert(entity, t.x, t.y, c.radius);
    }

    // player bullets vs enemies
    for (const bullet of world.query(BulletTag, Transform, Collider)) {
      const bt = bullet.getComponent<BulletTag>(BulletTag)!;
      if (bt.faction !== 'player') continue;
      const bTransform = bullet.getComponent<Transform>(Transform)!;
      const bCollider = bullet.getComponent<Collider>(Collider)!;

      const nearby = this.hash.query(bTransform.x, bTransform.y, bCollider.radius + 20);
      for (const other of nearby) {
        if (!other.hasComponent(EnemyTag)) continue;
        const oT = other.getComponent<Transform>(Transform)!;
        const oC = other.getComponent<Collider>(Collider)!;
        if (distance(bTransform.x, bTransform.y, oT.x, oT.y) < bCollider.radius + oC.radius) {
          this.events.push({ entityA: bullet, entityB: other, type: 'playerBullet_enemy' });
        }
      }
    }

    // enemy bullets vs player
    const player = world.queryFirst(PlayerTag, Transform, Collider);
    if (player) {
      const pT = player.getComponent<Transform>(Transform)!;
      const pC = player.getComponent<Collider>(Collider)!;

      for (const bullet of world.query(BulletTag, Transform, Collider)) {
        const bt = bullet.getComponent<BulletTag>(BulletTag)!;
        if (bt.faction !== 'enemy') continue;
        const bT = bullet.getComponent<Transform>(Transform)!;
        const bC = bullet.getComponent<Collider>(Collider)!;
        if (distance(pT.x, pT.y, bT.x, bT.y) < pC.radius + bC.radius) {
          this.events.push({ entityA: bullet, entityB: player, type: 'enemyBullet_player' });
        }
      }

      // player vs enemies (contact damage)
      for (const enemy of world.query(EnemyTag, Transform, Collider)) {
        const eT = enemy.getComponent<Transform>(Transform)!;
        const eC = enemy.getComponent<Collider>(Collider)!;
        if (distance(pT.x, pT.y, eT.x, eT.y) < pC.radius + eC.radius) {
          this.events.push({ entityA: player, entityB: enemy, type: 'player_enemy' });
        }
      }

      // player vs powerups
      for (const pu of world.query(PowerUpC, Transform, Collider)) {
        const puT = pu.getComponent<Transform>(Transform)!;
        const puC = pu.getComponent<Collider>(Collider)!;
        if (distance(pT.x, pT.y, puT.x, puT.y) < pC.radius + puC.radius + 16) {
          this.events.push({ entityA: player, entityB: pu, type: 'player_powerUp' });
        }
      }
    }
  }
}
```

**Step 2: 创建 `src/systems/DamageSystem.ts`**

```ts
import { System, World } from '@/ecs';
import { Health, BulletTag, SpriteC, PlayerTag, EnemyTag, Weapon, PowerUpC } from '@/components';
import { CollisionSystem } from './CollisionSystem';
import { CONFIG } from '@/game/config';

export class DamageSystem extends System {
  priority = 65;
  private collision: CollisionSystem;
  onPlayerDeath?: () => void;
  onEnemyKilled?: (x: number, y: number, score: number) => void;

  constructor(collision: CollisionSystem) {
    super();
    this.collision = collision;
  }

  update(world: World, dt: number): void {
    // tick invincibility timers
    const player = world.queryFirst(PlayerTag, Health);
    if (player) {
      const ph = player.getComponent<Health>(Health)!;
      if (ph.invincibleTimer > 0) {
        ph.invincibleTimer -= dt * (1000 / 60);
        // blink effect
        const sprite = player.getComponent<SpriteC>(SpriteC);
        if (sprite) sprite.display.alpha = Math.sin(ph.invincibleTimer * 0.3) > 0 ? 1 : 0.3;
      } else {
        const sprite = player.getComponent<SpriteC>(SpriteC);
        if (sprite) sprite.display.alpha = 1;
      }
    }

    for (const event of this.collision.events) {
      switch (event.type) {
        case 'playerBullet_enemy': {
          const bullet = event.entityA;
          const enemy = event.entityB;
          const bt = bullet.getComponent<BulletTag>(BulletTag)!;
          const eh = enemy.getComponent<Health>(Health);

          // remove bullet
          if (!bt.piercing) {
            const bs = bullet.getComponent<SpriteC>(SpriteC);
            if (bs) bs.display.destroy();
            world.removeEntity(bullet);
          }

          // damage enemy
          if (eh) {
            eh.current -= bt.damage;
            if (eh.current <= 0) {
              const tag = enemy.getComponent<EnemyTag>(EnemyTag);
              const { Transform } = require('@/components');
              const et = enemy.getComponent(Transform);
              const es = enemy.getComponent<SpriteC>(SpriteC);
              if (es) es.display.destroy();
              world.removeEntity(enemy);
              if (tag && et && this.onEnemyKilled) {
                this.onEnemyKilled(et.x, et.y, tag.scoreValue);
              }
            }
          }
          break;
        }

        case 'enemyBullet_player':
        case 'player_enemy': {
          const playerEntity = event.type === 'enemyBullet_player' ? event.entityB : event.entityA;
          const other = event.type === 'enemyBullet_player' ? event.entityA : event.entityB;
          const ph = playerEntity.getComponent<Health>(Health);
          const ptag = playerEntity.getComponent<PlayerTag>(PlayerTag);

          if (ph && ph.invincibleTimer <= 0) {
            if (ptag?.shieldActive) {
              ptag.shieldActive = false;
            } else {
              ph.invincibleTimer = CONFIG.PLAYER_INVINCIBLE_TIME;
              if (this.onPlayerDeath) this.onPlayerDeath();
            }
          }

          // remove bullet if it's a bullet collision
          if (event.type === 'enemyBullet_player') {
            const bs = other.getComponent<SpriteC>(SpriteC);
            if (bs) bs.display.destroy();
            world.removeEntity(other);
          }
          break;
        }

        case 'player_powerUp': {
          const playerEntity = event.entityA;
          const pu = event.entityB;
          const ptag = playerEntity.getComponent<PlayerTag>(PlayerTag);
          const puC = pu.getComponent<PowerUpC>(PowerUpC);
          const weapon = playerEntity.getComponent<Weapon>(Weapon);

          if (ptag && puC) {
            switch (puC.powerUpType) {
              case 'power':
                if (weapon && weapon.level < 3) weapon.level++;
                break;
              case 'shield':
                ptag.shieldActive = true;
                break;
              case 'bomb':
                ptag.bombs++;
                break;
              case 'score':
                ptag.score += 500;
                break;
            }
          }
          const pus = pu.getComponent<SpriteC>(SpriteC);
          if (pus) pus.display.destroy();
          world.removeEntity(pu);
          break;
        }
      }
    }
  }
}
```

**Step 3: 提交**

```bash
git add src/systems/CollisionSystem.ts src/systems/DamageSystem.ts
git commit -m "feat: add collision detection (spatial hash) and damage system"
```

---

### Task 13: 道具系统

**Files:**
- Create: `src/prefabs/createPowerUp.ts`
- Create: `src/systems/PowerUpSystem.ts`

**Step 1: 创建 `src/prefabs/createPowerUp.ts`**

```ts
import { Entity } from '@/ecs';
import { Transform, Velocity, Collider, SpriteC, PowerUpC } from '@/components';
import { drawPowerUp } from './drawShapes';
import type { PowerUpType } from '@/components';
import type { Container } from 'pixi.js';

const COLOR_MAP: Record<PowerUpType, number> = {
  power: 0xff4444,
  shield: 0x4488ff,
  bomb: 0xffcc00,
  score: 0x44ff44,
};

export function createPowerUp(type: PowerUpType, x: number, y: number, stage: Container): Entity {
  const color = COLOR_MAP[type];
  const display = drawPowerUp(color);
  stage.addChild(display);

  const entity = new Entity();
  entity
    .addComponent(new Transform(x, y))
    .addComponent(new Velocity(0, 1.5))
    .addComponent(new Collider(10, 'powerUp'))
    .addComponent(new SpriteC(display))
    .addComponent(new PowerUpC(type));
  return entity;
}
```

**Step 2: 创建 `src/systems/PowerUpSystem.ts`**

```ts
import { System, World } from '@/ecs';
import { Transform, PowerUpC, SpriteC } from '@/components';
import { CONFIG } from '@/game/config';

export class PowerUpSystem extends System {
  priority = 70;

  update(world: World, _dt: number): void {
    for (const entity of world.query(PowerUpC, Transform)) {
      const t = entity.getComponent<Transform>(Transform)!;
      if (t.y > CONFIG.GAME_HEIGHT + 20) {
        const s = entity.getComponent<SpriteC>(SpriteC);
        if (s) s.display.destroy();
        world.removeEntity(entity);
      }
    }
  }
}
```

**Step 3: 提交**

```bash
git add src/prefabs/createPowerUp.ts src/systems/PowerUpSystem.ts
git commit -m "feat: add power-up prefab and system"
```

---

### Task 14: 波次系统（关卡调度）

**Files:**
- Create: `src/data/waves.ts`
- Create: `src/systems/WaveSystem.ts`

**Step 1: 创建 `src/data/waves.ts`**

```ts
export interface WaveSpawn {
  enemyType: string;
  count: number;
  interval: number;   // ms between spawns
  xRange: [number, number];
}

export interface WaveDef {
  spawns: WaveSpawn[];
  delayAfter: number;  // ms before next wave
}

export const WAVES: WaveDef[] = [
  // Wave 1: easy intro
  { spawns: [{ enemyType: 'diamond', count: 4, interval: 800, xRange: [60, 420] }], delayAfter: 3000 },
  // Wave 2
  { spawns: [{ enemyType: 'diamond', count: 6, interval: 600, xRange: [60, 420] }], delayAfter: 3000 },
  // Wave 3
  { spawns: [
    { enemyType: 'diamond', count: 4, interval: 700, xRange: [60, 240] },
    { enemyType: 'hexagon', count: 2, interval: 1200, xRange: [240, 420] },
  ], delayAfter: 4000 },
  // Wave 4: aimed bullets introduced
  { spawns: [
    { enemyType: 'square', count: 4, interval: 800, xRange: [60, 420] },
    { enemyType: 'diamond', count: 3, interval: 600, xRange: [60, 420] },
  ], delayAfter: 4000 },
  // Wave 5
  { spawns: [
    { enemyType: 'hexagon', count: 4, interval: 900, xRange: [80, 400] },
    { enemyType: 'square', count: 3, interval: 700, xRange: [80, 400] },
  ], delayAfter: 4000 },
  // Wave 6: dense
  { spawns: [
    { enemyType: 'diamond', count: 8, interval: 400, xRange: [40, 440] },
    { enemyType: 'square', count: 4, interval: 800, xRange: [100, 380] },
  ], delayAfter: 5000 },
  // Wave 7: mid-boss (placeholder, uses hexagon with high HP)
  { spawns: [{ enemyType: 'hexagon', count: 1, interval: 0, xRange: [240, 240] }], delayAfter: 8000 },
  // Wave 8
  { spawns: [
    { enemyType: 'diamond', count: 6, interval: 500, xRange: [40, 440] },
    { enemyType: 'hexagon', count: 3, interval: 1000, xRange: [100, 380] },
    { enemyType: 'square', count: 3, interval: 800, xRange: [80, 400] },
  ], delayAfter: 5000 },
  // Wave 9
  { spawns: [
    { enemyType: 'square', count: 8, interval: 400, xRange: [40, 440] },
    { enemyType: 'hexagon', count: 4, interval: 800, xRange: [80, 400] },
  ], delayAfter: 5000 },
  // Wave 10
  { spawns: [
    { enemyType: 'diamond', count: 10, interval: 300, xRange: [40, 440] },
    { enemyType: 'hexagon', count: 4, interval: 700, xRange: [80, 400] },
    { enemyType: 'square', count: 5, interval: 600, xRange: [60, 420] },
  ], delayAfter: 6000 },
  // Wave 11: final boss (placeholder)
  { spawns: [{ enemyType: 'hexagon', count: 1, interval: 0, xRange: [240, 240] }], delayAfter: 0 },
];
```

**Step 2: 创建 `src/systems/WaveSystem.ts`**

```ts
import { System, World } from '@/ecs';
import { EnemyTag } from '@/components';
import { WAVES, WaveDef, WaveSpawn } from '@/data/waves';
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

  // power-up drop on enemy kill
  onEnemyKilledForDrop?: null;

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
    if (Math.random() > 0.25) return; // 25% drop rate
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
      // wait for all enemies to be cleared AND delay to pass
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
        const def = ENEMY_DEFS[timer.spawn.enemyType];
        if (def) {
          const x = randomRange(timer.spawn.xRange[0], timer.spawn.xRange[1]);
          world.addEntity(createEnemy(def, x, -20, this.stage));
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
```

**Step 3: 提交**

```bash
git add src/data/waves.ts src/systems/WaveSystem.ts
git commit -m "feat: add wave system with 11 waves of enemy spawns"
```

---

### Task 15: 粒子系统

**Files:**
- Create: `src/systems/ParticleSystem.ts`

**Step 1: 创建 `src/systems/ParticleSystem.ts`**

```ts
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
```

**Step 2: 提交**

```bash
git add src/systems/ParticleSystem.ts
git commit -m "feat: add particle system for explosion effects"
```

---

### Task 16: 背景星空

**Files:**
- Create: `src/systems/BackgroundSystem.ts`

**Step 1: 创建 `src/systems/BackgroundSystem.ts`**

```ts
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

    // init stars
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
```

**Step 2: 提交**

```bash
git add src/systems/BackgroundSystem.ts
git commit -m "feat: add scrolling starfield background"
```

---

### Task 17: HUD 系统

**Files:**
- Create: `src/systems/HudSystem.ts`

**Step 1: 创建 `src/systems/HudSystem.ts`**

```ts
import { System, World } from '@/ecs';
import { PlayerTag, Weapon, Health } from '@/components';
import { Text, Container, Graphics } from 'pixi.js';
import { CONFIG } from '@/game/config';

export class HudSystem extends System {
  priority = 95;
  private container: Container;
  private scoreText: Text;
  private livesText: Text;
  private bombsText: Text;
  private weaponText: Text;
  private waveText: Text;
  private bossBar: Graphics | null = null;
  private bossBarBg: Graphics | null = null;
  private lives = CONFIG.PLAYER_LIVES;

  constructor(stage: Container) {
    super();
    this.container = new Container();
    stage.addChild(this.container);

    const style = {
      fontFamily: 'Courier New, monospace',
      fontSize: 14,
      fill: 0x00ffcc,
    };

    this.scoreText = new Text({ text: 'SCORE: 0', style });
    this.scoreText.x = 8;
    this.scoreText.y = 4;
    this.container.addChild(this.scoreText);

    this.livesText = new Text({ text: `LIVES: ${this.lives}`, style: { ...style, fill: 0xff6666 } });
    this.livesText.x = 160;
    this.livesText.y = 4;
    this.container.addChild(this.livesText);

    this.bombsText = new Text({ text: 'BOMB: 3', style: { ...style, fill: 0xffcc00 } });
    this.bombsText.x = 280;
    this.bombsText.y = 4;
    this.container.addChild(this.bombsText);

    this.weaponText = new Text({ text: 'VULCAN Lv1', style: { ...style, fill: 0x88ccff } });
    this.weaponText.x = 380;
    this.weaponText.y = 4;
    this.container.addChild(this.weaponText);

    this.waveText = new Text({ text: '', style: { ...style, fontSize: 24, fill: 0xffffff } });
    this.waveText.anchor.set(0.5);
    this.waveText.x = CONFIG.GAME_WIDTH / 2;
    this.waveText.y = CONFIG.GAME_HEIGHT / 3;
    this.waveText.alpha = 0;
    this.container.addChild(this.waveText);
  }

  setLives(lives: number): void {
    this.lives = lives;
  }

  showWave(wave: number): void {
    this.waveText.text = `WAVE ${wave}`;
    this.waveText.alpha = 1;
    // fade out over time handled in update
  }

  update(world: World, dt: number): void {
    const player = world.queryFirst(PlayerTag);
    if (player) {
      const tag = player.getComponent<PlayerTag>(PlayerTag)!;
      const weapon = player.getComponent<Weapon>(Weapon);
      this.scoreText.text = `SCORE: ${tag.score}`;
      this.livesText.text = `LIVES: ${this.lives}`;
      this.bombsText.text = `BOMB: ${tag.bombs}`;
      if (weapon) {
        this.weaponText.text = `${weapon.weaponType.toUpperCase()} Lv${weapon.level}`;
      }
    }

    // fade wave text
    if (this.waveText.alpha > 0) {
      this.waveText.alpha -= 0.01 * dt;
    }
  }
}
```

**Step 2: 提交**

```bash
git add src/systems/HudSystem.ts
git commit -m "feat: add HUD system showing score, lives, bombs, weapon"
```

---

### Task 18: 场景管理 + Game 类

**Files:**
- Create: `src/game/Game.ts`
- Create: `src/game/scenes/TitleScene.ts`
- Create: `src/game/scenes/GameScene.ts`
- Create: `src/game/scenes/GameOverScene.ts`
- Modify: `src/main.ts`

**Step 1: 创建 `src/game/Game.ts`**

```ts
import { Application, Container } from 'pixi.js';
import { CONFIG } from './config';

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
```

**Step 2: 创建 `src/game/scenes/TitleScene.ts`**

```ts
import { Container, Text, Graphics } from 'pixi.js';
import type { Application } from 'pixi.js';
import type { Game, Scene } from '../Game';
import { CONFIG } from '../config';
import { GameScene } from './GameScene';

export class TitleScene implements Scene {
  container = new Container();
  private game!: Game;
  private handleKey = (e: KeyboardEvent) => {
    if (e.key === 'z' || e.key === 'Z' || e.key === 'Enter') {
      window.removeEventListener('keydown', this.handleKey);
      this.game.switchScene(new GameScene());
    }
  };

  init(app: Application, game: Game): void {
    this.game = game;

    // background
    const bg = new Graphics();
    bg.rect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
    bg.fill({ color: CONFIG.BACKGROUND_COLOR });
    this.container.addChild(bg);

    // title
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

    // subtitle
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

    // controls info
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

    // blink effect
    let visible = true;
    const interval = setInterval(() => {
      visible = !visible;
      sub.alpha = visible ? 1 : 0.3;
    }, 500);
    (this as any)._interval = interval;

    window.addEventListener('keydown', this.handleKey);
  }

  destroy(): void {
    window.removeEventListener('keydown', this.handleKey);
    clearInterval((this as any)._interval);
    this.container.destroy({ children: true });
  }
}
```

**Step 3: 创建 `src/game/scenes/GameOverScene.ts`**

```ts
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

  init(app: Application, game: Game): void {
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
```

**Step 4: 创建 `src/game/scenes/GameScene.ts`**

这是核心场景，整合所有系统：

```ts
import { Container } from 'pixi.js';
import type { Application } from 'pixi.js';
import type { Game, Scene } from '../Game';
import { CONFIG } from '../config';
import { World } from '@/ecs';
import { PlayerTag, SpriteC, BulletTag, EnemyTag } from '@/components';

// Systems
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

// Prefabs
import { createPlayer } from '@/prefabs/createPlayer';

// Scenes
import { GameOverScene } from './GameOverScene';

export class GameScene implements Scene {
  container = new Container();
  private world = new World();
  private game!: Game;
  private tickerFn?: (ticker: any) => void;
  private lives = CONFIG.PLAYER_LIVES;

  init(app: Application, game: Game): void {
    this.game = game;
    const world = this.world;

    // layers
    const gameLayer = new Container();
    this.container.addChild(gameLayer);

    // systems
    const inputSystem = new InputSystem();
    const { entity: playerEntity, container: playerContainer, hitbox } = createPlayer();
    gameLayer.addChild(playerContainer);
    world.addEntity(playerEntity);

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

    // callbacks
    hudSystem.setLives(this.lives);

    waveSystem.onWaveStart = (wave: number) => {
      hudSystem.showWave(wave);
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
        const player = world.queryFirst(PlayerTag);
        const score = player?.getComponent<PlayerTag>(PlayerTag)?.score ?? 0;
        // small delay before game over
        setTimeout(() => {
          game.switchScene(new GameOverScene(score));
        }, 1000);
      }
    };

    // bomb handler
    const bombHandler = (e: KeyboardEvent) => {
      if (e.key === 'x' || e.key === 'X') {
        const player = world.queryFirst(PlayerTag);
        if (!player) return;
        const tag = player.getComponent<PlayerTag>(PlayerTag)!;
        if (tag.bombs <= 0) return;
        tag.bombs--;

        // clear all enemy bullets
        for (const bullet of world.query(BulletTag)) {
          const bt = bullet.getComponent(BulletTag);
          if (bt && (bt as any).faction === 'enemy') {
            const s = bullet.getComponent<SpriteC>(SpriteC);
            if (s) s.display.destroy();
            world.removeEntity(bullet);
          }
        }
        // damage all enemies
        for (const enemy of world.query(EnemyTag)) {
          const { Health } = require('@/components');
          const h = enemy.getComponent(Health);
          if (h) (h as any).current -= 5;
        }

        particleSystem.emit(CONFIG.GAME_WIDTH / 2, CONFIG.GAME_HEIGHT / 2, 0xffcc00, 40);
      }
    };
    window.addEventListener('keydown', bombHandler);
    (this as any)._bombHandler = bombHandler;

    // start waves
    waveSystem.start();

    // game loop
    this.tickerFn = (ticker: any) => {
      world.update(ticker.deltaTime);
    };
    app.ticker.add(this.tickerFn);
  }

  destroy(): void {
    if (this.tickerFn) {
      this.game.app.ticker.remove(this.tickerFn);
    }
    window.removeEventListener('keydown', (this as any)._bombHandler);
    this.world.clear();
    this.container.destroy({ children: true });
  }
}
```

**Step 5: 更新 `src/main.ts`**

```ts
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
```

**Step 6: 验证**

```bash
npx vite --open
```

Expected: 标题画面 → 按 Z 进入游戏 → 敌人波次逐渐出现 → 可射击、拾取道具 → 死亡后显示 Game Over → 按 Z 重试。

**Step 7: 提交**

```bash
git add src/
git commit -m "feat: integrate all systems with scene management — full game loop"
```

---

### Task 19: DamageSystem 中的 require 修复 + 代码清理

**Files:**
- Modify: `src/systems/DamageSystem.ts` — 将 `require` 改为顶部 import

**Step 1: 修复 DamageSystem.ts**

在文件顶部 import 中添加 `Transform`：

```ts
import { Health, BulletTag, SpriteC, PlayerTag, EnemyTag, Weapon, PowerUpC, Transform } from '@/components';
```

替换 `onEnemyKilled` 回调中的 `require`：

```ts
const et = enemy.getComponent<Transform>(Transform);
```

同样修复 GameScene.ts 中 bomb handler 的 `require`：

```ts
import { PlayerTag, SpriteC, BulletTag, EnemyTag, Health } from '@/components';
```

bomb handler 中：

```ts
const h = enemy.getComponent<Health>(Health);
if (h) h.current -= 5;
```

**Step 2: 验证编译**

```bash
npx tsc --noEmit
```

Expected: 零错误。

**Step 3: 提交**

```bash
git add src/
git commit -m "fix: replace runtime require() with static imports"
```

---

### Task 20: Boss 预制件与多阶段弹幕

**Files:**
- Create: `src/prefabs/createBoss.ts`
- Create: `src/data/bosses.ts`
- Modify: `src/data/waves.ts` — Boss 波次使用 boss 类型
- Modify: `src/systems/WaveSystem.ts` — Boss 生成支持
- Modify: `src/prefabs/drawShapes.ts` — Boss 绘制

**Step 1: 创建 `src/data/bosses.ts`**

```ts
import type { PatternType, PatternParams } from '@/components';

export interface BossPhase {
  healthThreshold: number; // switch when HP% drops below this
  patterns: { type: PatternType; params: PatternParams }[];
}

export interface BossDef {
  name: string;
  health: number;
  score: number;
  phases: BossPhase[];
}

export const MID_BOSS: BossDef = {
  name: 'GUARDIAN',
  health: 80,
  score: 5000,
  phases: [
    {
      healthThreshold: 1.0,
      patterns: [
        { type: 'ring', params: { bulletCount: 12, speed: 2.5, rotationOffset: 0, fireRate: 800 } },
        { type: 'aimed', params: { bulletCount: 3, spreadAngle: Math.PI / 6, speed: 4, fireRate: 1200 } },
      ],
    },
    {
      healthThreshold: 0.5,
      patterns: [
        { type: 'spiral', params: { bulletCount: 1, speed: 3, arms: 4, rotationSpeed: 0.08, bulletInterval: 0, fireRate: 100 } },
        { type: 'fan', params: { bulletCount: 5, spreadAngle: Math.PI / 3, speed: 3.5, fireRate: 1000 } },
      ],
    },
  ],
};

export const FINAL_BOSS: BossDef = {
  name: 'OVERLORD',
  health: 160,
  score: 15000,
  phases: [
    {
      healthThreshold: 1.0,
      patterns: [
        { type: 'ring', params: { bulletCount: 16, speed: 2, rotationOffset: 0, fireRate: 600 } },
      ],
    },
    {
      healthThreshold: 0.66,
      patterns: [
        { type: 'spiral', params: { bulletCount: 1, speed: 3, arms: 5, rotationSpeed: 0.06, bulletInterval: 0, fireRate: 80 } },
        { type: 'aimed', params: { bulletCount: 5, spreadAngle: Math.PI / 4, speed: 4.5, fireRate: 900 } },
      ],
    },
    {
      healthThreshold: 0.33,
      patterns: [
        { type: 'spiral', params: { bulletCount: 1, speed: 3.5, arms: 6, rotationSpeed: 0.1, bulletInterval: 0, fireRate: 60 } },
        { type: 'ring', params: { bulletCount: 20, speed: 2.5, rotationOffset: 0, fireRate: 500 } },
        { type: 'random', params: { bulletCount: 6, speed: 3, angleRange: Math.PI * 2, fireRate: 400 } },
      ],
    },
  ],
};
```

**Step 2: 创建 `src/prefabs/createBoss.ts`**

```ts
import { Entity } from '@/ecs';
import { Transform, Velocity, Health, Collider, SpriteC, EnemyTag, BulletPattern } from '@/components';
import type { BossDef } from '@/data/bosses';
import type { Container } from 'pixi.js';
import { Graphics, BlurFilter } from 'pixi.js';

function drawBoss(isFinal: boolean): Container {
  const container = new import('pixi.js').Container();
  const color = isFinal ? 0xff2266 : 0xff8800;
  const size = isFinal ? 40 : 30;

  // outer rotating ring
  const ring = new Graphics();
  const points: number[] = [];
  const sides = isFinal ? 8 : 6;
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
    points.push(Math.cos(angle) * size, Math.sin(angle) * size);
  }
  ring.poly(points);
  ring.stroke({ color, width: 2 });
  ring.fill({ color, alpha: 0.1 });
  container.addChild(ring);

  // inner core
  const core = new Graphics();
  core.circle(0, 0, size * 0.4);
  core.fill({ color, alpha: 0.3 });
  core.stroke({ color: 0xffffff, width: 1 });
  container.addChild(core);

  // glow
  const glow = new Graphics();
  glow.circle(0, 0, size * 0.6);
  glow.fill({ color, alpha: 0.15 });
  glow.filters = [new BlurFilter({ strength: 8, quality: 2 })];
  container.addChildAt(glow, 0);

  return container;
}

export function createBoss(def: BossDef, x: number, y: number, stage: Container): Entity {
  const isFinal = def.health > 100;
  const display = drawBoss(isFinal);
  stage.addChild(display);

  const entity = new Entity();
  const firstPattern = def.phases[0].patterns[0];
  entity
    .addComponent(new Transform(x, -40))
    .addComponent(new Velocity(0, 0.8))
    .addComponent(new Health(def.health, def.health))
    .addComponent(new Collider(isFinal ? 36 : 28, 'enemy'))
    .addComponent(new SpriteC(display))
    .addComponent(new EnemyTag(isFinal ? 'finalBoss' : 'miniBoss'))
    .addComponent(new BulletPattern(firstPattern.type, { ...firstPattern.params }));

  const tag = entity.getComponent<EnemyTag>(EnemyTag)!;
  tag.scoreValue = def.score;

  // store boss def for phase switching
  (entity as any).__bossDef = def;
  (entity as any).__currentPhase = 0;

  return entity;
}
```

注意：`drawBoss` 函数中有 inline import 的问题，改为在文件顶部 import `Container`（已在 import 行声明 `type { Container }`，改为直接 import）。

修正后的 `drawBoss`：

```ts
import { Container as PixiContainer, Graphics, BlurFilter } from 'pixi.js';

function drawBoss(isFinal: boolean): PixiContainer {
  const container = new PixiContainer();
  // ... 其余不变
}
```

**Step 3: 提交**

```bash
git add src/
git commit -m "feat: add boss definitions and boss prefab with multi-phase support"
```

---

### Task 21: Boss 阶段切换逻辑 + 波次系统 Boss 集成

**Files:**
- Create: `src/systems/BossPhaseSystem.ts`
- Modify: `src/systems/WaveSystem.ts`
- Modify: `src/data/waves.ts`
- Modify: `src/game/scenes/GameScene.ts`

**Step 1: 创建 `src/systems/BossPhaseSystem.ts`**

```ts
import { System, World } from '@/ecs';
import { Health, EnemyTag, BulletPattern } from '@/components';
import type { BossDef } from '@/data/bosses';

export class BossPhaseSystem extends System {
  priority = 72;
  onPhaseChange?: (phase: number) => void;

  update(world: World, _dt: number): void {
    for (const entity of world.query(EnemyTag, Health, BulletPattern)) {
      const tag = entity.getComponent<EnemyTag>(EnemyTag)!;
      if (tag.enemyType !== 'miniBoss' && tag.enemyType !== 'finalBoss') continue;

      const bossDef = (entity as any).__bossDef as BossDef | undefined;
      if (!bossDef) continue;

      const health = entity.getComponent<Health>(Health)!;
      const hpPercent = health.current / health.max;
      const currentPhase = (entity as any).__currentPhase as number;

      // check if should switch to next phase
      for (let i = currentPhase + 1; i < bossDef.phases.length; i++) {
        if (hpPercent <= bossDef.phases[i].healthThreshold) {
          (entity as any).__currentPhase = i;
          const newPattern = bossDef.phases[i].patterns[0];
          const bp = entity.getComponent<BulletPattern>(BulletPattern)!;
          bp.patternType = newPattern.type;
          bp.params = { ...newPattern.params };
          bp.elapsed = 0;
          bp.currentAngle = 0;
          this.onPhaseChange?.(i);
          break;
        }
      }
    }
  }
}
```

**Step 2: 更新 `src/data/waves.ts` — Boss 波次标记**

在 `WaveSpawn` 接口中添加可选的 `isBoss` 字段：

```ts
export interface WaveSpawn {
  enemyType: string;
  count: number;
  interval: number;
  xRange: [number, number];
  isBoss?: 'mid' | 'final';
}
```

更新 Wave 7 和 Wave 11：

```ts
// Wave 7: mid-boss
{ spawns: [{ enemyType: 'miniBoss', count: 1, interval: 0, xRange: [240, 240], isBoss: 'mid' }], delayAfter: 4000 },
// ...
// Wave 11: final boss
{ spawns: [{ enemyType: 'finalBoss', count: 1, interval: 0, xRange: [240, 240], isBoss: 'final' }], delayAfter: 0 },
```

**Step 3: 更新 `src/systems/WaveSystem.ts` — Boss 生成**

Import boss 数据和 prefab：

```ts
import { createBoss } from '@/prefabs/createBoss';
import { MID_BOSS, FINAL_BOSS } from '@/data/bosses';
```

在 spawn 逻辑中加入 Boss 分支：

```ts
if (timer.spawn.isBoss) {
  const bossDef = timer.spawn.isBoss === 'mid' ? MID_BOSS : FINAL_BOSS;
  world.addEntity(createBoss(bossDef, x, -40, this.stage));
} else {
  const def = ENEMY_DEFS[timer.spawn.enemyType];
  if (def) {
    world.addEntity(createEnemy(def, x, -20, this.stage));
  }
}
```

**Step 4: 更新 `src/game/scenes/GameScene.ts` — 注册 BossPhaseSystem**

```ts
import { BossPhaseSystem } from '@/systems/BossPhaseSystem';

// 在 init 中
const bossPhaseSystem = new BossPhaseSystem();
bossPhaseSystem.onPhaseChange = (phase) => {
  particleSystem.emit(CONFIG.GAME_WIDTH / 2, 100, 0xffffff, 30);
};
world.addSystem(bossPhaseSystem);
```

**Step 5: 验证**

Expected: Wave 7 出现中 Boss，有多阶段弹幕切换。Wave 11 出现最终 Boss。

**Step 6: 提交**

```bash
git add src/
git commit -m "feat: add boss phase system and integrate bosses into wave flow"
```

---

### Task 22: Boss 移动 AI（到达定位后左右移动）

**Files:**
- Modify: `src/systems/EnemySystem.ts`

**Step 1: 更新 EnemySystem — Boss 到达后横向移动**

```ts
import { System, World } from '@/ecs';
import { Transform, Velocity, EnemyTag, SpriteC } from '@/components';
import { CONFIG } from '@/game/config';

export class EnemySystem extends System {
  priority = 20;

  update(world: World, dt: number): void {
    for (const entity of world.query(EnemyTag, Transform, Velocity)) {
      const tag = entity.getComponent<EnemyTag>(EnemyTag)!;
      const t = entity.getComponent<Transform>(Transform)!;
      const v = entity.getComponent<Velocity>(Velocity)!;

      // Boss behavior: stop at y=100, then strafe
      if (tag.enemyType === 'miniBoss' || tag.enemyType === 'finalBoss') {
        if (t.y >= 100 && v.vy > 0) {
          v.vy = 0;
          v.vx = 1;
        }
        // bounce off walls
        if (t.x < 60) v.vx = Math.abs(v.vx);
        if (t.x > CONFIG.GAME_WIDTH - 60) v.vx = -Math.abs(v.vx);

        // slow rotation for visual effect
        t.rotation += 0.005 * dt;
        continue;
      }

      // regular enemies: remove if off bottom
      if (t.y > CONFIG.GAME_HEIGHT + 60) {
        const sprite = entity.getComponent<SpriteC>(SpriteC);
        if (sprite) sprite.display.destroy();
        world.removeEntity(entity);
      }
    }
  }
}
```

**Step 2: 提交**

```bash
git add src/systems/EnemySystem.ts
git commit -m "feat: add boss strafing AI and wall bouncing"
```

---

### Task 23: 最终整合测试与验证

**Step 1: 构建检查**

```bash
npx tsc --noEmit
```

Expected: 零错误。

**Step 2: 运行 dev server**

```bash
npx vite --open
```

**Step 3: 手动验证清单**

- [ ] 标题画面显示，按 Z 进入游戏
- [ ] 玩家可用 WASD/方向键移动
- [ ] Shift 切换低速模式，显示判定点
- [ ] Z 键射击，1/2/3 切换武器
- [ ] 敌人按波次出现，发射弹幕
- [ ] 碰撞检测正常（击杀敌人、被弹幕击中）
- [ ] 道具掉落并可拾取
- [ ] Boss 出现并有阶段切换
- [ ] X 键使用炸弹清屏
- [ ] 死亡后闪烁无敌
- [ ] 生命耗尽 → Game Over 画面
- [ ] Game Over 按 Z 重新开始
- [ ] HUD 正确显示分数/生命/炸弹/武器
- [ ] 粒子爆炸效果正常
- [ ] 背景星空滚动

**Step 4: 最终提交**

```bash
git add -A
git commit -m "feat: complete 2D danmaku shooting game v1.0"
```

---

## 总结

共 23 个 Task，涵盖：
1. **Task 1**: 项目脚手架
2. **Task 2-3**: ECS 核心（Entity, Component, System, World）
3. **Task 4**: 工具类（math, pool, spatial-hash）
4. **Task 5**: 所有组件定义
5. **Task 6**: 输入系统
6. **Task 7**: 程序化绘制 + 玩家预制件
7. **Task 8**: 玩家系统 + 移动 + 渲染（首次可玩）
8. **Task 9**: 武器 + 子弹系统（玩家射击）
9. **Task 10**: 敌人数据 + 预制件 + 系统
10. **Task 11**: 5 种弹幕模式
11. **Task 12**: 碰撞 + 伤害系统
12. **Task 13**: 道具系统
13. **Task 14**: 波次调度系统
14. **Task 15**: 粒子效果
15. **Task 16**: 星空背景
16. **Task 17**: HUD
17. **Task 18**: 场景管理（标题/游戏/结束）
18. **Task 19**: 代码修复
19. **Task 20-22**: Boss 系统（预制件、阶段切换、AI）
20. **Task 23**: 最终整合验证
