import { Subject } from './Subject';
import { Subscriber } from './Subscriber';
import { Subscription } from './Subscription';
import { ObjectUnsubscribedError } from '../util/ObjectUnsubscribedError';

export class BehaviorSubject<T> extends Subject<T> {
  constructor(
    private storedValue: T
  ) {
    super();
  }

  get value(): T {
    return this.getValue();
  }

  public getValue(): T {
    if (this.hasError) {
      throw this.thrownError;
    } else if (this.closed) {
      throw new ObjectUnsubscribedError();
    } else {
      return this.storedValue;
    }
  }

  protected safeSubscribe(subscriber: Subscriber<T>): Subscription {
    const subjectSubscription = super.safeSubscribe(subscriber);
    if (subjectSubscription) {
      subscriber.next(this.storedValue);
    }

    return subjectSubscription;
  }

  public next(v: T) {
    this.storedValue = v;
    super.next(v);
  }
}