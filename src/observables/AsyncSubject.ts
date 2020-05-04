import { Subject } from './Subject';
import { Subscriber } from './Subscriber';
import { Subscription } from './Subscription';
import { SubjectSubscription } from './SubjectSubscription';

export class AsyncSubject<T> extends Subject<T> {
  private storedValue: T;
  private hasNext = false;

  public next(v: T) {
    if (this.isStopped) {
      return;
    }
    this.hasNext = true;
    this.storedValue = v;
  }

  public complete() {
    if (this.hasNext) {
      super.next(this.storedValue);
    }
    super.complete();
  }

  protected safeSubscribe(subscriber: Subscriber<T>): Subscription {
    let subscription = this.tryForCompletedSubscription();
    if (subscription) {
      if (this.hasError) {
        subscriber.error(this.thrownError);
      }
      if (this.isStopped) {
        if (this.hasNext) {
          subscriber.next(this.storedValue);
        }
        subscriber.complete();
      }
      return subscription;
    }

    this.observers.push(subscriber);
    subscription = new SubjectSubscription(this, subscriber);
    subscriber.subscription = subscription;
    return subscription;
  }
}