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
    if (this.entitiesToAdd.length > 0) {
      this.entities.push(...this.entitiesToAdd);
      this.entitiesToAdd.length = 0;
    }
    for (const system of this.systems) {
      system.update(this, dt);
    }
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
