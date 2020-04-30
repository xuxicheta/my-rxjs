import { Observable } from './Observable';
import { Subscription } from './Subscription';
import { of } from '../creation/of';
import { throwError } from '../creation/throwError';
import { empty } from '../creation/empty';
import { map } from '../operators/map';

/** @test {Observable} */
describe.skip('Observable', () => {
  it('should be constructed with a subscriber function', (done) => {
    const source$ = new Observable<number>((observer) => {
      observer.next(1);
      observer.complete();
    });

    source$.subscribe({
      next(x: number) {
        expect(x).toBe(1);
      },
      complete: done,
    });
  });

  it('should send errors thrown in the constructor down the error path', (done) => {
    const source$ = new Observable<number>((observer) => {
      throw new Error('this should be handled');
    });

    source$.subscribe({
      error(err) {
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(Error);
        expect(err).toHaveProperty('message', 'this should be handled');
        done();
      }
    });
  });

  it('should allow empty ctor, which is effectively a never-observable', () => {
    const result$ = new Observable<any>();
    expect(result$).toBeInstanceOf(Observable);
  });

  describe('subscribe', () => {
    it('should be synchronous', () => {
      let subscribed = false;
      let nextValue: string;
      let completed: boolean;
      const source$ = new Observable<string>((observer) => {
        subscribed = true;
        observer.next('wee');
        expect(nextValue).toBe('wee');
        observer.complete();
        expect(completed).toBeTruthy();
      });

      expect(subscribed).toBeFalsy();

      let mutatedByNext = false;
      let mutatedByComplete = false;

      source$.subscribe({
        next(x: string) {
          nextValue = x;
          mutatedByNext = true;
        },
        complete() {
          completed = true;
          mutatedByComplete = true;
        },
      });

      expect(mutatedByNext).toBeTruthy();
      expect(mutatedByComplete).toBeTruthy();
    });

    it('should work when subscribe is called with no arguments', () => {
      const source$ = new Observable<string>((subscriber) => {
        subscriber.next('foo');
        subscriber.complete();
      });

      source$.subscribe();
    });

    it('should not be unsubscribed when other empty subscription completes', () => {
      let unsubscribeCalled = false;
      const source$ = new Observable<number>(() => {
        return () => {
          unsubscribeCalled = true;
        };
      });
      const empty$ = new Observable();

      source$.subscribe();

      expect(unsubscribeCalled).toBeFalsy();
      empty$.subscribe();
      expect(unsubscribeCalled).toBeFalsy();
    });

    it('should not be unsubscribed when other subscription with same observer completes', () => {
      let unsubscribeCalled = false;
      const source$ = new Observable<number>(() => {
        return () => {
          unsubscribeCalled = true;
        };
      });
      const empty$ = new Observable();

      const observer = {
        next() { /*noop*/ }
      };

      source$.subscribe(observer);

      expect(unsubscribeCalled).toBeFalsy();
      empty$.subscribe();
      expect(unsubscribeCalled).toBeFalsy();
    });

    it('should run unsubscription logic when an error is sent asynchronously and subscribe is called with no arguments', (done) => {
      jest.useFakeTimers()

      let unsubscribeCalled = false;
      const source$ = new Observable<number>(observer => {
        const id = setInterval(() => {
          observer.error(0);
        }, 1);
        return () => {
          clearInterval(id);
          unsubscribeCalled = true;
        };
      });

      source$.subscribe({
        error(err) {
        }
      });

      setTimeout(() => {
        let err;
        let errHappened = false;
        try {
          expect(unsubscribeCalled).toBeTruthy();
        } catch (e) {
          err = e;
          errHappened = true;
        } finally {
          if (!errHappened) {
            done();
          } else {
            done(err);
          }
        }
      }, 100);

      jest.advanceTimersByTime(110);
    });

    it('should return a Subscription that calls the unsubscribe function returned by the subscriber', () => {
      let unsubscribeCalled = false;

      const source$ = new Observable<number>(() => {
        return () => {
          unsubscribeCalled = true;
        };
      });

      const sub = source$.subscribe(() => { });

      expect(sub).toBeInstanceOf(Subscription);
      expect(unsubscribeCalled).toBeFalsy();
      expect(sub.unsubscribe).toBeInstanceOf(Function);

      sub.unsubscribe();
      expect(unsubscribeCalled).toBeTruthy();
    });

    it('should ignore next messages after unsubscription', (done) => {
      jest.useRealTimers();
      let times = 0;

      const source$ = new Observable<number>((observer) => {
        let i = 0;
        const id = setInterval(() => {
          observer.next(i++);
        });

        return () => {
          clearInterval(id);
          expect(times).toBe(2);
          done();
        };
      });


      const subscription = source$.subscribe(() => {
        times += 1
        if (times === 2) {
          subscription.unsubscribe();
        }
      });
    });

    it('should ignore error messages after unsubscription', (done) => {
      let times = 0;
      let errorCalled = false;

      const source$ = new Observable<number>((observer) => {
        let i = 0;
        const id = setInterval(() => {
          observer.next(i++);
          if (i === 3) {
            observer.error(new Error());
          }
        });

        return () => {
          clearInterval(id);
          expect(times).toBe(2);
          expect(errorCalled).toBeFalsy();
          done();
        };
      })

      const subscription = source$.subscribe(() => {
        times += 1;
        if (times === 2) {
          subscription.unsubscribe();
        }
      },
        () => { errorCalled = true; }
      );
    });

    it('should ignore complete messages after unsubscription', (done) => {
      let times = 0;
      let completeCalled = false;

      const subscription = new Observable<number>((observer) => {
        let i = 0;
        const id = setInterval(() => {
          observer.next(i++);
          if (i === 3) {
            observer.complete();
          }
        });

        return () => {
          clearInterval(id);
          expect(times).toBe(2);
          expect(completeCalled).toBeFalsy();
          done();
        };
      })
        .subscribe(() => {
          times += 1
          if (times === 2) {
            subscription.unsubscribe();
          }
        },
          null,
          () => { completeCalled = true; }
        );
    });
  });

  describe('when called with an anonymous observer', () => {
    it('should accept an anonymous observer with just a next function and call the next function in the context' +
      ' of the anonymous observer', (done) => {
        // intentionally not using lambda to avoid typescript's this context capture
        const o = {
          myValue: 'foo',
          next(x: any) {
            expect(this.myValue).toBe('foo');
            expect(x).toEqual(1);
            done();
          }
        };

        of(1).subscribe(o);
      });


    it('should accept an anonymous observer with just an error function and call the error function in the context' +
      ' of the anonymous observer', (done) => {
        // intentionally not using lambda to avoid typescript's this context capture
        const o = {
          myValue: 'foo',
          error(err: any) {
            expect(this.myValue).toEqual('foo');
            expect(err).toEqual('bad');
            done();
          }
        };

        throwError('bad').subscribe(o);
      });
  });

  it('should accept an anonymous observer with just a complete function and call the complete function in the' +
    ' context of the anonymous observer', (done) => {
      // intentionally not using lambda to avoid typescript's this context capture
      const o = {
        myValue: 'foo',
        complete: function complete() {
          expect(this.myValue).toEqual('foo');
          done();
        }
      };

      empty().subscribe(o);
    });

  it('should accept an anonymous observer with no functions at all', () => {
    expect(() => {
      empty().subscribe({} as any);
    }).not.toThrow();
  });

  it('should ignore next messages after unsubscription', (done) => {
    let times = 0;

    const source$ = new Observable<number>((observer) => {
      let i = 0;
      const id = setInterval(() => {
        observer.next(i++);
      });

      return () => {
        clearInterval(id);
        expect(times).toEqual(2);
        done();
      };
    });

    const subscription = source$.subscribe({
      next() {
        times += 1;
        if (times === 2) {
          subscription.unsubscribe();
        }
      }
    });
  });

  it('should ignore error messages after unsubscription', (done) => {
    let times = 0;
    let errorCalled = false;

    const subscription = new Observable<number>((observer) => {
      let i = 0;
      const id = setInterval(() => {
        observer.next(i++);
        if (i === 3) {
          observer.error(new Error());
        }
      });
      return () => {
        clearInterval(id);
        expect(times).toEqual(2);
        expect(errorCalled).toBeFalsy();
        done();
      };
    })
      .subscribe({
        next() {
          times += 1;
          if (times === 2) {
            subscription.unsubscribe();
          }
        },
        error() { errorCalled = true; }
      });
  });

  it('should ignore complete messages after unsubscription', (done) => {
    let times = 0;
    let completeCalled = false;

    const subscription = new Observable<number>((observer) => {
      let i = 0;
      const id = setInterval(() => {
        observer.next(i++);
        if (i === 3) {
          observer.complete();
        }
      });

      return () => {
        clearInterval(id);
        expect(times).toEqual(2);
        expect(completeCalled).toBeFalsy();
        done();
      };
    })
      .subscribe({
        next() {
          times += 1;
          if (times === 2) {
            subscription.unsubscribe();
          }
        },
        complete() { completeCalled = true; }
      });

  });


  describe('pipe', () => {
    it('should exist', () => {
      const source$ = of('test');
      expect(typeof source$.pipe).toBe('function');
    });

    it('should pipe multiple operations', (done) => {
      of('test')
        .pipe(
          map((x) => x + x),
          map((x) => x + '!!!')
        )
        .subscribe(
          x => {
            expect(x).toEqual('testtest!!!');
          },
          null,
          done
        );
    });

    it('should return the same observable if there are no arguments', () => {
      const source$ = of('test');
      const result$ = source$.pipe();
      expect(result$).toEqual(source$);
    });
  });
});
