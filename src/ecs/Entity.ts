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
