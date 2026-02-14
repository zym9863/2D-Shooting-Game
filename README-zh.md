# 2D Shooting Game (NEON BARRAGE)

语言: [English](./README.md) | [简体中文](./README-zh.md)

一个基于 **PixiJS 8 + TypeScript + Vite** 构建的纵版 2D 弹幕射击游戏，采用 **ECS (Entity-Component-System)** 架构。

## 功能特性

- 11 个波次，包含中 Boss 和最终 Boss
- 多种弹幕模式：`fan`、`ring`、`spiral`、`aimed`、`random`
- 3 种玩家武器：`vulcan`、`spread`、`laser`
- 道具系统：`power`、`shield`、`bomb`、`score`
- HUD 与标题/结算场景
- 使用对象池与空间哈希碰撞优化性能

## 环境要求

- Node.js 18+
- 推荐使用 `pnpm`（仓库已包含 `pnpm-lock.yaml`）

## 快速开始

```bash
pnpm install
pnpm dev
```

构建与预览：

```bash
pnpm build
pnpm preview
```

如果你使用 npm：

```bash
npm install
npm run dev
```

## 操作说明

- 移动：`方向键` / `WASD`
- 射击：`Z`
- 炸弹：`X`
- 低速精确移动：`Shift`
- 切换武器：`1` / `2` / `3`
- 开始 / 重开：`Enter` 或 `Z`

## 项目结构

```text
src/
  main.ts                 # 应用入口
  game/
    Game.ts               # 场景切换
    config.ts             # 全局配置
    scenes/               # Title / Game / GameOver
  ecs/                    # ECS 核心
  components/             # 纯数据组件
  systems/                # 游戏逻辑系统
  prefabs/                # 实体工厂
  data/                   # 敌人/Boss/波次配置
  utils/                  # 数学、对象池、空间哈希
docs/plans/               # 设计与规划文档
```

## ECS 执行流程

系统按优先级形成清晰流水线：
输入 -> 玩家 -> 敌人与弹幕 -> 移动 -> 碰撞与伤害 -> 掉落与波次 -> 粒子 -> 渲染/HUD。

## 可调参数位置

- 全局常量：`src/game/config.ts`
- 波次配置：`src/data/waves.ts`
- 敌人属性与弹幕：`src/data/enemies.ts`
- Boss 阶段与弹幕：`src/data/bosses.ts`

