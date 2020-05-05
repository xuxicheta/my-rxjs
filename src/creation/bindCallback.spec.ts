/* tslint:disable: ban-types */
import { bindCallback } from './bindCallback';

/** @test {bindCallback} */
describe('bindCallback', () => {
  describe('when not scheduled', () => {
    it('should emit undefined from a callback without arguments', () => {
      function callback(cb: Function) {
        cb();
      }
      const boundCallback = bindCallback(callback);
      const results: Array<string|number> = [];

      boundCallback()
        .subscribe((x: any) => {
          results.push(typeof x);
        }, null, () => {
          results.push('done');
        });

      expect(results).toEqual(['undefined', 'done']);
    });

    it('should emit one value from a callback', () => {
      function callback(datum: number, cb: (result: number) => void) {
        cb(datum);
      }
      const boundCallback = bindCallback<number>(callback);
      const results: Array<string|number> = [];

      boundCallback(42)
        .subscribe(x => {
          results.push(x);
        }, null, () => {
          results.push('done');
        });

      expect(results).toEqual([42, 'done']);
    });

    it('should set callback function context to context of returned function', () => {
      function callback(this: any, cb: Function) {
        cb(this.datum);
      }

      const boundCallback = bindCallback<number>(callback);
      const results: Array<string|number> = [];

      boundCallback.apply({datum: 5})
        .subscribe(
          (x: number) => results.push(x),
          null,
          () => results.push('done')
        );

      expect(results).toEqual([5, 'done']);
    });

    it('should not emit, throw or complete if immediately unsubscribed', (done) => {
      const nextSpy = jest.fn();;
      const throwSpy = jest.fn();;
      const completeSpy = jest.fn();;
      let timeout: number;

      function callback(datum: number, cb: Function) {
        // Need to cb async in order for the unsub to trigger
        timeout = setTimeout(() => {
          cb(datum);
        });
      }
      const subscription = bindCallback(callback)(42)
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

  it('should not swallow post-callback errors', () => {
    const originalConsole = console;
    const mockedWarn = jest.fn();
    global.console = {
      ...console,
      warn: mockedWarn,
    }

    function badFunction(callback: (answer: number) => void): void {
      callback(42);
      throw new Error('kaboom');
    }
    try {
      bindCallback(badFunction)().subscribe();
      expect(mockedWarn).toHaveBeenCalledTimes(1);
    } finally {
      global.console = originalConsole;
    }
  });
});
