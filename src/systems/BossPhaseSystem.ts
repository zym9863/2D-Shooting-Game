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
