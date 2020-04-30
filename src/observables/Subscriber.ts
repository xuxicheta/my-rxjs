import { Observer, PartialObserver } from './types';
import { Subscription } from './Subscription';
import { partialObserver } from '../internals/partial-observer';

export class Subscriber<T> implements Observer<T> {
  protected destination: Observer<T>;
  public subscription: Subscription = new Subscription();

  constructor(
    destinationOrNext: PartialObserver<T> | ((value: T) => void) | null,
    error?: ((e?: any) => void) | null,
    complete?: (() => void) | null
  ) {
    this.destination = partialObserver(destinationOrNext, error, complete);
    this.destination.error = this.destination.error || ((err) => console.warn(err));
  }

  next(v?: T) {
    if (this.subscription.closed) {
      return;
    }
    this.destination.next(v);
  }

  error(e?: any) {
    if (this.subscription.closed) {
      return;
    }
    this.destination.error(e);
    this.unsubscribe();
  }

  complete() {
    if (this.subscription.closed) {
      return;
    }
    this.destination.complete();
    this.unsubscribe();
  }

  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}