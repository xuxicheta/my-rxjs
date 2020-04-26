import { Observer, PartialObserver } from './types';
import { Subscription } from './Subscription';
import { partialObserver } from '../internals/partial-observer';

export class Subscriber<T> implements Observer<T> {
  protected destination: Observer<T>;
  public subscription: Subscription;

  constructor(
    destinationOrNext: PartialObserver<T> | ((value: T) => void) | null,
    error?: ((e?: any) => void) | null,
    complete?: (() => void) | null
  ) {
    this.destination = partialObserver(destinationOrNext, error, complete);
    this.destination.error = this.destination.error || ((err) => console.warn(err));
  }

  next(v) {
    this.destination.next(v);
  }

  error(e) {
    this.destination.error(e);
    this.unsubscribe();
  }

  complete() {
    this.destination.complete();
    this.unsubscribe();
  }

  private unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}