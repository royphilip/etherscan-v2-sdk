import { Transport } from '../core/transport';

export class BaseModule {
  constructor(
    protected transport: Transport,
    protected client?: { checkDisposed: () => void }
  ) {}

  public checkDisposed(): void {
    this.client?.checkDisposed();
  }
}

// Create a proxy around the instance to check disposal on method calls
export function createDisposalCheckedInstance<T extends BaseModule>(instance: T): T {
  return new Proxy(instance, {
    get: (target, prop) => {
      const value = Reflect.get(target, prop);
      if (typeof value === 'function' && prop !== 'constructor') {
        return (...args: any[]) => {
          target.checkDisposed();
          return value.apply(target, args);
        };
      }
      return value;
    },
  }) as T;
}
