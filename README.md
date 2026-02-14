# 2D Shooting Game (NEON BARRAGE)

Language: [English](./README.md) | [简体中文](./README-zh.md)

A vertical 2D bullet-hell shooter built with **PixiJS 8 + TypeScript + Vite**, using an **ECS (Entity-Component-System)** architecture.

## Features

- 11 waves, including a mid boss and final boss
- Multiple bullet patterns: `fan`, `ring`, `spiral`, `aimed`, `random`
- 3 player weapons: `vulcan`, `spread`, `laser`
- Power-up system: `power`, `shield`, `bomb`, `score`
- HUD + title/game-over scenes
- Object pooling and spatial-hash collision for performance

## Requirements

- Node.js 18+
- `pnpm` recommended (`pnpm-lock.yaml` is included)

## Quick Start

```bash
pnpm install
pnpm dev
```

Build and preview:

```bash
pnpm build
pnpm preview
```

If you use npm:

```bash
npm install
npm run dev
```

## Controls

- Move: `Arrow Keys` / `WASD`
- Shoot: `Z`
- Bomb: `X`
- Slow movement (precision): `Shift`
- Switch weapon: `1` / `2` / `3`
- Start / Retry: `Enter` or `Z`

## Project Structure

```text
src/
  main.ts                 # App entry
  game/
    Game.ts               # Scene switching
    config.ts             # Global config
    scenes/               # Title / Game / GameOver
  ecs/                    # ECS core
  components/             # Pure data components
  systems/                # Game logic systems
  prefabs/                # Entity factories
  data/                   # Enemy/Boss/Wave config
  utils/                  # Math, pool, spatial hash
docs/plans/               # Design and planning docs
```

## ECS Flow

Systems run by priority in a clear pipeline:
input -> player -> enemy/pattern -> movement -> collision/damage -> drops/waves -> particles -> render/HUD.

## Tunable Data

- Global constants: `src/game/config.ts`
- Wave progression: `src/data/waves.ts`
- Enemy stats/patterns: `src/data/enemies.ts`
- Boss phases/patterns: `src/data/bosses.ts`
