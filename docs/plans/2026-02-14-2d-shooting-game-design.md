# 2D 弹幕射击游戏设计文档

## 概述

纵向弹幕射击游戏（STG），霓虹几何视觉风格，使用 PixiJS 8 + TypeScript + Vite 构建。零外部素材，全部程序化生成。

## 技术栈

- **语言**：TypeScript
- **渲染**：PixiJS 8（WebGL）
- **构建**：Vite
- **素材**：无外部素材，PixiJS Graphics API 程序化绘制

## 架构：ECS（Entity-Component-System）

### Entity

纯 ID 容器，通过 `addComponent` / `getComponent` 管理组件。

### Component（纯数据）

| 组件 | 字段 |
|------|------|
| Transform | x, y, rotation, scaleX, scaleY |
| Velocity | vx, vy, angularVelocity |
| Health | current, max, invincibleTimer |
| Collider | radius, layer |
| Sprite | PixiJS 显示对象引用 |
| PlayerTag | 标记 |
| EnemyTag | type |
| BulletTag | faction ('player' \| 'enemy'), damage, piercing |
| BulletPattern | patternType, params |
| Weapon | type, level, fireRate, lastFiredAt |
| PowerUp | type |

### System（执行顺序）

1. InputSystem — 读取键盘状态
2. PlayerSystem — 玩家移动/射击意图
3. EnemySystem — 敌人 AI 路径
4. BulletPatternSystem — 弹幕发射逻辑
5. WeaponSystem — 玩家武器发射
6. MovementSystem — 应用速度到位置
7. CollisionSystem — 空间哈希碰撞检测
8. DamageSystem — 碰撞结果处理
9. PowerUpSystem — 道具生成与拾取
10. WaveSystem — 波次调度、Boss 生成
11. ParticleSystem — 粒子效果更新
12. RenderSystem — 同步到 PixiJS 显示树

### World

持有实体/系统注册表，提供 `query(ComponentA, ComponentB)` 查询，驱动每帧 `update(dt)`。

### 对象池

子弹和粒子使用对象池回收复用，屏幕外子弹自动回收。

## 弹幕模式

| 模式 | 描述 | 参数 |
|------|------|------|
| Fan（散射） | 扇形发射多发子弹 | bulletCount, spreadAngle, speed |
| Ring（环形） | 360° 均匀发射 | bulletCount, speed, rotationOffset |
| Spiral（螺旋） | 旋转发射螺旋轨迹 | arms, rotationSpeed, bulletInterval |
| Aimed（追踪） | 朝玩家方向发射 | bulletCount, spreadAngle, speed |
| Random（随机） | 随机角度散射 | bulletCount, angleRange, speedRange |

Boss 通过组合多种模式 + 阶段切换实现复杂弹幕。

## 武器系统

| 武器 | 特点 |
|------|------|
| Vulcan（直射） | 高射速窄范围直线弹 |
| Spread（散射） | 扇形 3-5 发，覆盖广单发伤害低 |
| Laser（激光） | 持续照射光束，高 DPS 需保持瞄准 |

按 Z/X/C 或 1/2/3 切换，可通过道具升级（最多 3 级）。

## 道具系统

| 道具 | 效果 | 颜色 |
|------|------|------|
| Power | 当前武器升 1 级 | 红色 |
| Shield | 获得 1 次护盾 | 蓝色 |
| Bomb | 清屏 + 全屏伤害 | 黄色 |
| Score | 额外分数 | 绿色 |

## 玩家机制

- **判定点**：中心 3px 半径圆形碰撞体
- **低速模式**：按住 Shift 降低速度，显示判定点
- **Bomb**：按 X 清屏 + 短暂无敌
- **生命**：3 条命，被击中后短暂无敌闪烁

## 关卡波次

| 波次 | 内容 |
|------|------|
| 1-3 | 基础小兵（散射/直射），熟悉操作 |
| 4-6 | 混合兵种 + 追踪弹，提升难度 |
| 7 | 中 Boss（2 阶段弹幕） |
| 8-10 | 高密度弹幕 + 新兵种 |
| 11 | 最终 Boss（3 阶段弹幕） |

## 视觉风格：霓虹几何

### 实体外观

- **玩家**：亮青色三角形 + 辉光描边，低速模式显示白色判定点
- **敌人**：红色菱形 / 橙色六边形 / 紫色方块（按类型区分）
- **Boss**：多层嵌套旋转复合几何体，多段式结构
- **玩家弹**：青色/绿色小圆点 + 拖尾残影
- **敌方弹**：粉红/紫色/橙色大圆形，便于辨识

### 粒子效果

- 击杀爆炸：颜色碎片扩散 + 淡出
- 擦弹特效：子弹经过判定点附近时微弱闪光
- Boss 阶段切换：全屏闪光 + 粒子爆发

### 背景

深色（#0a0a1a）底 + 缓慢滚动星空点阵。

### 辉光

PixiJS BlurFilter 叠加明亮颜色模拟辉光，大量子弹用 alpha 渐变替代滤镜。

### UI/HUD

顶部显示：分数 | 生命数 | 炸弹数 | 武器等级。Boss 血条居中显示。

## 项目结构

```
src/
├── main.ts
├── game/
│   ├── Game.ts
│   ├── scenes/
│   └── config.ts
├── ecs/
│   ├── Entity.ts
│   ├── Component.ts
│   ├── System.ts
│   └── World.ts
├── components/
├── systems/
├── prefabs/
├── data/
└── utils/
    ├── math.ts
    ├── pool.ts
    └── spatial-hash.ts
```
