import { Observable } from './Observable';
import { SubscriptionLike, Observer } from './types';
import { Subscriber } from './Subscriber';
import { ObjectUnsubscribedError } from '../util/ObjectUnsubscribedError';
import { Subscription } from './Subscription';
import { SubjectSubscription } from './SubjectSubscription';
import { directObserver } from '../internals/direct-observer';

export class Subject<T> extends Observable<T> implements SubscriptionLike, Observer<T> {
  closed = false;
  protected hasError = false;
  protected thrownError: any;
  protected isStopped = false;
  protected observers: Observer<T>[] = [];

  unsubscribe() {
    this.stop();
    this.closed = true;
  }

  private stop() {
    this.isStopped = true;
    this.observers = [];
  }

  next(v: T) {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }
    if (this.isStopped) {
      return;
    }
    this.observers.forEach(observer => observer.next(v));
  }

  error(err: any) {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }
    if (this.isStopped) {
      return;
    }
    this.hasError = true;
    this.thrownError = err;
    this.observers.forEach(observer => observer.error(err));
    this.stop();
  }

  complete() {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }
    if (this.isStopped) {
      return;
    }

    this.observers
      .slice()
      .forEach(observer => observer.complete());

    this.stop();
  }

  asObservable() {
    return new Observable<T>(observer => {
      this.subscribe(directObserver(observer))
    })
  }

  protected safeSubscribe(subscriber: Subscriber<T>): Subscription {
    let subscription = this.tryForCompletedSubscription();
    if (subscription) {
      this.sendCompleted(subscriber);
      return subscription;
    }

    this.observers.push(subscriber);
    subscription = new SubjectSubscription(this, subscriber);
    subscriber.subscription = subscription;
    return subscription;
  }

  protected tryForCompletedSubscription(): Subscription {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }
    if (this.hasError) {
      return Subscription.EMPTY;
    }
    if (this.isStopped) {
      return Subscription.EMPTY;
    }
  }

  protected sendCompleted(subscriber: Subscriber<T>) {
    if (this.hasError) {
      subscriber.error(this.thrownError);
    }
    if (this.isStopped) {
      subscriber.complete();
    }
  }

}