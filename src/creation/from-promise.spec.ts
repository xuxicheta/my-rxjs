import { fromPromise } from './from-promise';

/** @test {fromPromise} */
describe('from (fromPromise)', () => {
  it('should emit one value from a resolved promise', (done) => {
    const promise = Promise.resolve(42);
    fromPromise(promise)
      .subscribe(
        (x) => { expect(x).toEqual(42); },
        (x) => {
          done(new Error('should not be called'));
        }, () => {
          done();
        });
  });

  it('should raise error from a rejected promise', (done) => {
    const promise = Promise.reject('bad');
    fromPromise(promise)
      .subscribe((x) => {
          done(new Error('should not be called'));
        },
        (e) => {
          expect(e).toEqual('bad');
          done();
        }, () => {
         done(new Error('should not be called'));
       });
  });

  it('should share the underlying promise with multiple subscribers', (done) => {
    const promise = Promise.resolve(42);
    const observable = fromPromise(promise);

    observable
      .subscribe(
        (x) => { expect(x).toEqual(42); },
        (x) => {
          done(new Error('should not be called'));
        }, undefined);
    setTimeout(() => {
      observable
        .subscribe(
          (x) => { expect(x).toEqual(42); },
          (x) => {
            done(new Error('should not be called'));
          }, () => {
            done();
          });
    });
  });

  it('should accept already-resolved Promise', (done) => {
    const promise = Promise.resolve(42);
    promise.then((x) => {
      expect(x).toEqual(42);
      fromPromise(promise)
        .subscribe(
          (y) => { expect(y).toEqual(42); },
          (x) => {
            done(new Error('should not be called'));
          }, () => {
            done();
          });
    }, () => {
      done(new Error('should not be called'));
    });
  });


  it('should not emit, throw or complete if immediately unsubscribed', (done) => {
    const nextSpy = jest.fn();;
    const throwSpy = jest.fn();;
    const completeSpy = jest.fn();;
    const promise = Promise.resolve(42);
    const subscription = fromPromise(promise)
      .subscribe(nextSpy, throwSpy, completeSpy);
    subscription.unsubscribe();

    setTimeout(() => {
      expect(nextSpy).toHaveBeenCalledTimes(0);
      expect(throwSpy).toHaveBeenCalledTimes(0);
      expect(completeSpy).toHaveBeenCalledTimes(0);
      done();
    });
  });
});
