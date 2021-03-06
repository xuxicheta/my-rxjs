import { Subscription } from './Subscription';
import { Observable } from './Observable';
import { merge } from '../creation/merge';

/** @test {Subscription} */
describe('Subscription', () => {
  describe('Subscription.add()', () => {
    it('Should return self if the self is passed', () => {
      const sub = new Subscription();
      const ret = sub.add(sub);

      expect(ret).toEqual(sub);
    });

    it('Should return Subscription.EMPTY if it is passed', () => {
      const sub = new Subscription();
      const ret = sub.add(Subscription.EMPTY);

      expect(ret).toEqual(Subscription.EMPTY);
    });

    it('Should return Subscription.EMPTY if it is called with `void` value', () => {
      const sub = new Subscription();
      const ret = sub.add(undefined);
      expect(ret).toEqual(Subscription.EMPTY);
    });

    it('Should return a new Subscription created with teardown function if it is passed a function', () => {
      const sub = new Subscription();

      let isCalled = false;
      const ret = sub.add(() => {
        isCalled = true;
      });
      ret.unsubscribe();

      expect(isCalled).toEqual(true);
    });

    it('Should wrap the AnonymousSubscription and return a subscription that unsubscribes and removes it when unsubbed', () => {
      const sub = new Subscription();
      let called = false;
      const arg = {
        unsubscribe: () => called = true,
      };
      const ret = sub.add(arg);

      expect(called).toEqual(false);
      expect((sub as any).children.length).toEqual(1);
      ret.unsubscribe();
      expect(called).toEqual(true);
      expect((sub as any).children.length).toEqual(0);
    });

    it('Should return the passed one if passed a AnonymousSubscription having not function `unsubscribe` member', () => {
      const sub = new Subscription();
      const arg = {
        isUnsubscribed: false,
        unsubscribe: undefined as any,
      };
      const ret = sub.add(arg as any);

      expect(ret).toEqual(arg);
    });

    it('Should return the passed one if the self has been unsubscribed', () => {
      const main = new Subscription();
      main.unsubscribe();

      const child = new Subscription();
      const ret = main.add(child);

      expect(ret).toEqual(child);
    });

    it('Should unsubscribe the passed one if the self has been unsubscribed', () => {
      const main = new Subscription();
      main.unsubscribe();

      let isCalled = false;
      const child = new Subscription(() => {
        isCalled = true;
      });
      main.add(child);

      expect(isCalled).toEqual(true);
    });
  });

  describe('Subscription.unsubscribe()', () => {
    it('Should unsubscribe from all subscriptions, when some of them throw', done => {
      const tearDowns: number[] = [];

      const source1$ = new Observable(() => {
        return () => {
          tearDowns.push(1);
        };
      });

      const source2$ = new Observable(() => {
        return () => {
          tearDowns.push(2);
          throw new Error('oops, I am a bad unsubscribe!');
        };
      });

      const source3$ = new Observable(() => {
        return () => {
          tearDowns.push(3);
        };
      });

      const allSub = merge(source1$, source2$, source3$).subscribe();

      setTimeout(() => {
        expect(() => allSub.unsubscribe()).toThrow();
        expect(tearDowns).toEqual([1, 2, 3]);
        done();
      }, 10);
    });

    it('Should unsubscribe from all subscriptions, when adding a bad custom subscription to a subscription', done => {
      const tearDowns: number[] = [];

      const sub = new Subscription();

      const source1$ = new Observable(() => {
        return () => {
          tearDowns.push(1);
        };
      });

      const source2$ = new Observable(() => {
        return () => {
          tearDowns.push(2);
          sub.add(({
            unsubscribe: () => {
              expect(sub.closed).toBeTruthy();
              throw new Error('Who is your daddy, and what does he do?');
            }
          }));
        };
      });

      const source3$ = new Observable(() => {
        return () => {
          tearDowns.push(3);
        };
      });

      sub.add(merge(source1$, source2$, source3$).subscribe());

      setTimeout(() => {
        expect(() => {
          sub.unsubscribe();
        }).toThrow()
        expect(tearDowns).toEqual([1, 2, 3]);
        done();
      });
    });
  });
});
