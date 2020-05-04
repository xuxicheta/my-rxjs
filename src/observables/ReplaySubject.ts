import { Subject } from './Subject';
import { Subscriber } from './Subscriber';
import { Subscription } from './Subscription';
import { ObjectUnsubscribedError } from '../util/ObjectUnsubscribedError';
import { SubjectSubscription } from './SubjectSubscription';

interface ReplayRecord<T> {
  value: T;
  time?: number;
}

export class ReplaySubject<T> extends Subject<T> {
  private buffer: ReplayRecord<T>[] = [];

  constructor(
    private bufferSize: number = Number.POSITIVE_INFINITY,
    private windowTime: number = Number.POSITIVE_INFINITY
  ) {
    super();
    this.bufferSize = Math.ceil(Math.max(1, this.bufferSize));
    this.windowTime = Math.ceil(Math.max(this.windowTime));
  }

  next(v: T) {
    this.buffer.push({
      value: v,
      time: Date.now(),
    });
    if (this.buffer.length > this.bufferSize) {
      this.buffer.shift();
    }
    super.next(v);
  }

  protected safeSubscribe(subscriber: Subscriber<T>): Subscription {
    this.actualizeBuffer();
    let subscription: Subscription = this.tryForCompletedSubscription();

    this.observers.push(subscriber);
    subscription = new SubjectSubscription(this, subscriber);
    subscriber.subscription = subscription;

    const len = this.buffer.length;
    for (let i = 0; i < len; i++) {
      if (subscriber.subscription.closed) {
        break;
      }
      subscriber.next(this.buffer[i].value);
    }

    this.sendCompleted(subscriber);

    return subscription;
  }

  private actualizeBuffer() {
    const lastTime = Date.now() - this.windowTime;

    let lastIndex = 0;
    for(let index = this.buffer.length - 1; index > 0; index -= 1) {
      if (this.buffer[index].time < lastTime) {
        lastIndex = index;
        break;
      }
    }
    this.buffer.splice(0, lastIndex);
  }

}