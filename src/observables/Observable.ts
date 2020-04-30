import { Subscriber } from './Subscriber';
import { Subscription } from './Subscription';
import { OperatorFunction, PartialObserver, Subscribable, TeardownLogic, Observer } from './types';

export class Observable<T> implements Subscribable<T> {
  // private subscribers: Subscriber<T>[] = [];

  constructor(
    private producerFn: (observer?: Observer<T>) => TeardownLogic = () => null,
  ) { }

  subscribe(
    observerOrNext?: PartialObserver<T> | ((value: T) => void) | null,
    error?: ((error: any) => void) | null,
    complete?: (() => void) | null
  ): Subscription {
    const subscriber = new Subscriber(observerOrNext, error, complete);

    return this.safeSubscribe(subscriber);
  }

  protected safeSubscribe(subscriber: Subscriber<T>): Subscription {
    try {
      const tearDown = this.producerFn(subscriber);
      subscriber.subscription = new Subscription(tearDown)
    } catch (err) {
      subscriber.error(err);
    }

    return subscriber.subscription;
  }

  pipe(...operations: OperatorFunction<any, any>[]): Observable<any> {
    if (operations.length === 0) {
      return this as any;
    }

    return operations.reduce((prev: any, fn) => fn(prev), this)
  }
}
