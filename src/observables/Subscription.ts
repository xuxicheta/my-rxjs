import { SubscriptionLike, TeardownLogic } from './types';

export class Subscription implements SubscriptionLike {
  public closed = false;
  private _subscriptions: SubscriptionLike[] = [];

  constructor(private teardown?: TeardownLogic) {
  }

  unsubscribe(): void {
    if (typeof this.teardown === 'function') {
      this.teardown();
    }
    if (this.teardown instanceof Subscription) {
      this.teardown.unsubscribe();
    }

    this._subscriptions.forEach(sub => sub.unsubscribe());
    this._subscriptions = null;
  }
}