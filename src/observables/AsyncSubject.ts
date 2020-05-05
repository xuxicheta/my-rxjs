import { Subject } from './Subject';
import { Subscriber } from './Subscriber';
import { Subscription } from './Subscription';
import { SubjectSubscription } from './SubjectSubscription';

export class AsyncSubject<T> extends Subject<T> {
  private storedValue: T;
  private hasNext = false;
  private hasCompleted = false;

  public next(v: T) {
    if (this.hasCompleted) {
      return;
    }
    this.hasNext = true;
    this.storedValue = v;
  }

  public error(err: any) {
    if (this.hasCompleted) {
      return;
    }
    super.error(err);
  }

  public complete() {
    if (this.hasNext) {
      super.next(this.storedValue);
    }
    this.hasCompleted = true;
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