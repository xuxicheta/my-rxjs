import { Subscriber } from './Subscriber';
import { Subscription } from './Subscription';
import { OperatorFunction, PartialObserver, Subscribable, TeardownLogic } from './types';

export class Observable<T> implements Subscribable<T> {
  private subscribers: Subscriber<T>[] = [];

  constructor(
    private subscriptionFn?: (observer?: PartialObserver<T>) => TeardownLogic
  ) { }

  subscribe(
    observerOrNext?: PartialObserver<T> | ((value: T) => void) | null,
    error?: ((error: any) => void) | null,
    complete?: (() => void) | null
  ): Subscription {
    const subscriber = new Subscriber(observerOrNext, error, complete);
    this.subscribers.push(subscriber);

    let subscription: Subscription;
    try {
      const tearDown = this.subscriptionFn && this.subscriptionFn(subscriber);
      subscription = new Subscription(tearDown)
    } catch (err) {
      subscriber.error(err);
      subscription = new Subscription();
    }
    subscriber.subscription = subscription;

    return subscription;
  }

  pipe(...operations: OperatorFunction<any, any>[]): Observable<any> {
    if (operations.length === 0) {
      return this as any;
    }

    return operations.reduce((prev: any, fn) => fn(prev), this)
  }
}
