/* tslint:disable: ban-types */

import { bindNodeCallback } from './bindNodeCallback';

/** @test {bindNodeCallback} */
describe('bindNodeCallback', () => {
  describe('when not scheduled', () => {
    it('should emit undefined when callback is called without success arguments', () => {
      function callback(cb: Function) {
        cb(null);
      }

      const boundCallback = bindNodeCallback(callback);
      const results: Array<number | string> = [];

      boundCallback()
        .subscribe((x: any) => {
          results.push(typeof x);
        }, null, () => {
          results.push('done');
        });

      expect(results).toEqual(['undefined', 'done']);
    });

    it('should emit one value from a callback', () => {
      function callback(datum: number, cb: (err: any, n: number) => void) {
        cb(null, datum);
      }
      const boundCallback = bindNodeCallback<number>(callback);
      const results: Array<number | string> = [];

      boundCallback(42)
        .subscribe(x => {
          results.push(x);
        }, null, () => {
          results.push('done');
        });

      expect(results).toEqual([42, 'done']);
    });

    it('should set context of callback to context of boundCallback', () => {
      function callback(this: { datum: number }, cb: (err: any, n: number) => void) {
        cb(null, this.datum);
      }
      const boundCallback = bindNodeCallback(callback);
      const results: Array<number | string> = [];

      boundCallback.call({datum: 42})
        .subscribe(
          (x: number) => results.push(x),
          null,
          () => results.push('done')
        );

      expect(results).toEqual([42, 'done']);
    });

    it('should raise error from callback', () => {
      const error = new Error();

      function callback(cb: Function) {
        cb(error);
      }

      const boundCallback = bindNodeCallback(callback);
      const results: Array<number | string> = [];

      boundCallback()
        .subscribe(() => {
          throw new Error('should not next');
        }, (err: any) => {
          results.push(err);
        }, () => {
          throw new Error('should not complete');
        });

      expect(results).toEqual([error]);
    });

    it('should not emit, throw or complete if immediately unsubscribed', (done) => {
      const nextSpy = jest.fn();;
      const throwSpy = jest.fn();;
      const completeSpy = jest.fn();;
      let timeout: number;
      function callback(datum: number, cb: (err: any, n: number) => void) {
        // Need to cb async in order for the unsub to trigger
        timeout = setTimeout(() => {
          cb(null, datum);
        });
      }
      const subscription = bindNodeCallback(callback)(42)
        .subscribe(nextSpy, throwSpy, completeSpy);
      subscription.unsubscribe();

      setTimeout(() => {
        expect(nextSpy).toHaveBeenCalledTimes(0);
        expect(throwSpy).toHaveBeenCalledTimes(0);
        expect(completeSpy).toHaveBeenCalledTimes(0);

        clearTimeout(timeout);
        done();
      });
    });
  });


  it('should cache value for next subscription and not call callbackFunc again', () => {
    let calls = 0;
    function callback(datum: number, cb: (err: any, n: number) => void) {
      calls++;
      cb(null, datum);
    }
    const boundCallback = bindNodeCallback(callback);
    const results1: Array<number | string> = [];
    const results2: Array<number | string> = [];

    const source = boundCallback(42);

    source.subscribe((x: any) => {
      results1.push(x);
    }, null, () => {
      results1.push('done');
    });

    source.subscribe((x: any) => {
      results2.push(x);
    }, null, () => {
      results2.push('done');
    });


    expect(calls).toBe(1);
    expect(results1).toEqual([42, 'done']);
    expect(results2).toEqual([42, 'done']);
  });

  it('should not swallow post-callback errors', () => {
    const originalConsole = console;
    const mockedWarn = jest.fn();
    global.console = {
      ...console,
      warn: mockedWarn,
    }

    function badFunction(callback: (error: Error, answer: number) => void): void {
      callback(null as any, 42);
      throw new Error('kaboom');
    }
    try {
      bindNodeCallback(badFunction)().subscribe();
      expect(mockedWarn).toHaveBeenCalledTimes(1);
    } finally {
      global.console = originalConsole;
    }
  });
});
