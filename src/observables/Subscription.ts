import { SubscriptionLike, TeardownLogic } from './types';

export class Subscription implements SubscriptionLike {
  public static EMPTY: Subscription = (() => {
    const empty = new Subscription();
    (empty as any).closed = true;
    return empty;
  })();

  public closed = false;
  private children: SubscriptionLike[] = [];
  private parents: Subscription[] = [];


  constructor(private teardown?: TeardownLogic) {
  }

  unsubscribe(): void {
    let errors: Error[] = [];

    errors = errors.concat(this.unsubscribeTeardown());
    errors = errors.concat(this.unsubscribeChildren());

    this.parents.forEach(parent => parent.remove(this));
    this.closed = true;

    if (errors.length) {
      throw new Error('Unsubscription error');
    }
  }

  private unsubscribeTeardown(): Error[] {
    return this.safeCall(() => {
      if (typeof this.teardown === 'function') {
        this.teardown();
      }
      if (this.teardown instanceof Subscription) {
        this.teardown.unsubscribe();
      }
    })
  }

  private unsubscribeChildren(): Error[] {
    let child;
    let errors: Error[] = [];
    // tslint:disable-next-line: no-conditional-assignment
    while (child = this.children.shift()) {
      errors = errors.concat(this.safeCall(() => child.unsubscribe()))
    }
    return errors;
  }

  private safeCall(cb: () => void): Error[] {
    try {
      cb();
      return [];
    } catch (e) {
      return [e];
    }
  }

  add(teardown: TeardownLogic): Subscription {
    if (!teardown) {
      return Subscription.EMPTY;
    }

    const subscription: Subscription = this.subscriptionFromTeardown(teardown);

    if (!this.closed) {
      this.addToParents(subscription);
      this.children.push(subscription);
    }

    return subscription;
  }

  remove(subscription: Subscription): void {
    const { children } = this;
    const subscriptionIndex = children.indexOf(subscription);
    if (subscriptionIndex !== -1) {
      children.splice(subscriptionIndex, 1);
    }
  }

  private subscriptionFromTeardown(teardown: TeardownLogic): Subscription {
    const subscription = teardown as Subscription;

    switch (typeof teardown) {
      case 'function': return new Subscription(teardown);
      case 'object': return this.subscriptionFromObject(subscription);
      default: {
        throw new Error('unrecognized teardown ' + teardown + ' added to Subscription.');
      }
    }
  }

  private subscriptionFromObject(subscription: any): Subscription {
    if (this.closed) {
      subscription.unsubscribe();
      return subscription;
    }
    if (subscription instanceof Subscription || subscription === this || subscription.closed) {
      return subscription;
    }
    if (typeof subscription.unsubscribe === 'function') {
      return new Subscription(() => subscription.unsubscribe());
    }
    if (typeof subscription.unsubscribe !== 'function') {
      return subscription;
    }

  }

  private addToParents(subscription) {
    const { parents } = subscription;

    if (!parents) {
      return;
    }

    if (parents.indexOf(this) === -1) {
      // Only add `this` to the _parentOrParents list if it's not already there.
      parents.push(this);
    } else {
      // The `subscription` already has `this` as a parent.
      return subscription;
    }
  }
}