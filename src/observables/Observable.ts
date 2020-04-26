import { Subscribable, PartialObserver, Unsubscribable } from './types';

export class Observable<T> implements Subscribable<T> {

  constructor(private subscriptionFn?: (observer: PartialObserver<T>) => Unsubscribable) {
  }

  subscribe(observer?: PartialObserver<T>): Unsubscribable {
    return this.subscriptionFn(observer);
  }
}