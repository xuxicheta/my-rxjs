import { SubscriptionLike } from './types';

export class Subscription implements SubscriptionLike {
  public closed = false;
  private _subscriptions: SubscriptionLike[] | null = null;

  constructor(private unsubscribeFn?: () => void) {
  }

  unsubscribe(): void {
    if (this.unsubscribeFn) {
      this.unsubscribeFn();
    }

    this._subscriptions.forEach(sub => sub.unsubscribe());
    this._subscriptions = null;
  }
}