import { Subject } from './Subject';
import { ObjectUnsubscribedError } from '../util/ObjectUnsubscribedError';
import { of } from '../creation/of';
import { delay } from '../operators/delay';
import { Observer } from './types';
import { Observable } from './Observable';

/** @test {Subject} */
describe('Subject', () => {
  it('should pump values right on through itself', (done) => {
    const subject$$ = new Subject<string>();
    const expected = ['foo', 'bar'];

    subject$$.subscribe((x: string) => {
      expect(x).toEqual(expected.shift());
    }, null, done);

    subject$$.next('foo');
    subject$$.next('bar');
    subject$$.complete();
  });

  it('should pump values to multiple subscribers', (done) => {
    const subject$ = new Subject<string>();
    const expected = ['foo', 'bar'];

    let i = 0;
    let j = 0;

    subject$.subscribe(function (x) {
      expect(x).toEqual(expected[i++]);
    });

    subject$.subscribe(function (x) {
      expect(x).toEqual(expected[j++]);
    }, null, done);

    expect((subject$ as any as { observers: Observer<any>[] }).observers.length).toEqual(2);
    subject$.next('foo');
    subject$.next('bar');
    subject$.complete();
  });

  it('should handle subscribers that arrive and leave at different times, ' +
  'subject$ does not complete', () => {
    const subject$ = new Subject<number>();
    const results1: (number | string)[] = [];
    const results2: (number | string)[] = [];
    const results3: (number | string)[] = [];

    subject$.next(1);
    subject$.next(2);
    subject$.next(3);
    subject$.next(4);

    const subscription1 = subject$.subscribe(
      function (x) { results1.push(x); },
      function (e) { results1.push('E'); },
      () => { results1.push('C'); }
    );

    subject$.next(5);

    const subscription2 = subject$.subscribe(
      function (x) { results2.push(x); },
      function (e) { results2.push('E'); },
      () => { results2.push('C'); }
    );

    subject$.next(6);
    subject$.next(7);

    subscription1.unsubscribe();

    subject$.next(8);

    subscription2.unsubscribe();

    subject$.next(9);
    subject$.next(10);

    const subscription3 = subject$.subscribe(
      function (x) { results3.push(x); },
      function (e) { results3.push('E'); },
      () => { results3.push('C'); }
    );

    subject$.next(11);

    subscription3.unsubscribe();

    expect(results1).toEqual([5, 6, 7]);
    expect(results2).toEqual([6, 7, 8]);
    expect(results3).toEqual([11]);
  });

  it('should handle subscribers that arrive and leave at different times, ' +
  'subject$ completes', () => {
    const subject$ = new Subject<number>();
    const results1: (number | string)[] = [];
    const results2: (number | string)[] = [];
    const results3: (number | string)[] = [];

    subject$.next(1);
    subject$.next(2);
    subject$.next(3);
    subject$.next(4);

    const subscription1 = subject$.subscribe(
      function (x) { results1.push(x); },
      function (e) { results1.push('E'); },
      () => { results1.push('C'); }
    );

    subject$.next(5);

    const subscription2 = subject$.subscribe(
      function (x) { results2.push(x); },
      function (e) { results2.push('E'); },
      () => { results2.push('C'); }
    );

    subject$.next(6);
    subject$.next(7);

    subscription1.unsubscribe();

    subject$.complete();

    subscription2.unsubscribe();

    const subscription3 = subject$.subscribe(
      function (x) { results3.push(x); },
      function (e) { results3.push('E'); },
      () => { results3.push('C'); }
    );

    subscription3.unsubscribe();

    expect(results1).toEqual([5, 6, 7]);
    expect(results2).toEqual([6, 7, 'C']);
    expect(results3).toEqual(['C']);
  });

  it('should handle subscribers that arrive and leave at different times, ' +
  'subject$ terminates with an error', () => {
    const subject$ = new Subject<number>();
    const results1: (number | string)[] = [];
    const results2: (number | string)[] = [];
    const results3: (number | string)[] = [];

    subject$.next(1);
    subject$.next(2);
    subject$.next(3);
    subject$.next(4);

    const subscription1 = subject$.subscribe(
      function (x) { results1.push(x); },
      function (e) { results1.push('E'); },
      () => { results1.push('C'); }
    );

    subject$.next(5);

    const subscription2 = subject$.subscribe(
      function (x) { results2.push(x); },
      function (e) { results2.push('E'); },
      () => { results2.push('C'); }
    );

    subject$.next(6);
    subject$.next(7);

    subscription1.unsubscribe();

    subject$.error(new Error('err'));

    subscription2.unsubscribe();

    const subscription3 = subject$.subscribe(
      function (x) { results3.push(x); },
      function (e) { results3.push('E'); },
      () => { results3.push('C'); }
    );

    subscription3.unsubscribe();

    expect(results1).toEqual([5, 6, 7]);
    expect(results2).toEqual([6, 7, 'E']);
    expect(results3).toEqual(['E']);
  });

  it('should handle subscribers that arrive and leave at different times, ' +
  'subject$ completes before nexting any value', () => {
    const subject$ = new Subject<number>();
    const results1: (number | string)[] = [];
    const results2: (number | string)[] = [];
    const results3: (number | string)[] = [];

    const subscription1 = subject$.subscribe(
      function (x) { results1.push(x); },
      function (e) { results1.push('E'); },
      () => { results1.push('C'); }
    );

    const subscription2 = subject$.subscribe(
      function (x) { results2.push(x); },
      function (e) { results2.push('E'); },
      () => { results2.push('C'); }
    );

    subscription1.unsubscribe();

    subject$.complete();

    subscription2.unsubscribe();

    const subscription3 = subject$.subscribe(
      function (x) { results3.push(x); },
      function (e) { results3.push('E'); },
      () => { results3.push('C'); }
    );

    subscription3.unsubscribe();

    expect(results1).toEqual([]);
    expect(results2).toEqual(['C']);
    expect(results3).toEqual(['C']);
  });

  it('should disallow new subscriber once subject$ has been disposed', () => {
    const subject$ = new Subject<number>();
    const results1: (number | string)[] = [];
    const results2: (number | string)[] = [];
    const results3: (number | string)[] = [];

    const subscription1 = subject$.subscribe(
      function (x) { results1.push(x); },
      function (e) { results1.push('E'); },
      () => { results1.push('C'); }
    );

    subject$.next(1);
    subject$.next(2);

    const subscription2 = subject$.subscribe(
      function (x) { results2.push(x); },
      function (e) { results2.push('E'); },
      () => { results2.push('C'); }
    );

    subject$.next(3);
    subject$.next(4);
    subject$.next(5);

    subscription1.unsubscribe();
    subscription2.unsubscribe();
    subject$.unsubscribe();

    expect(() => {
      subject$.subscribe(
        function (x) { results3.push(x); },
        function (err) {
          expect(false).toEqual('should not throw error: ' + err.toString());
        }
      );
    }).toThrow(ObjectUnsubscribedError);

    expect(results1).toEqual([1, 2, 3, 4, 5]);
    expect(results2).toEqual([3, 4, 5]);
    expect(results3).toEqual([]);
  });

  it('should not allow values to be nexted after it is unsubscribed', (done) => {
    const subject$ = new Subject();
    const expected = ['foo'];

    subject$.subscribe(function (x) {
      expect(x).toEqual(expected.shift());
    });

    subject$.next('foo');
    subject$.unsubscribe();
    expect(() => subject$.next('bar')).toThrow(ObjectUnsubscribedError);
    done();
  });

  it('should clean out unsubscribed subscribers', (done) => {
    const subject$ = new Subject();

    const sub1 = subject$.subscribe(function (x) {
      // noop
    });

    const sub2 = subject$.subscribe(function (x) {
      // noop
    });

    expect((subject$ as any as { observers: Observer<any>[] }).observers.length).toEqual(2);
    sub1.unsubscribe();
    expect((subject$ as any as { observers: Observer<any>[] }).observers.length).toEqual(1);
    sub2.unsubscribe();
    expect((subject$ as any as { observers: Observer<any>[] }).observers.length).toEqual(0);
    done();
  });

  it('should be an Observer which can be given to Observable.subscribe', (done) => {
    const source$ = of(1, 2, 3, 4, 5);
    const subject$ = new Subject();
    const expected = [1, 2, 3, 4, 5];

    subject$.subscribe(
      function (x) {
        expect(x).toEqual(expected.shift());
      }, (x) => {
        done(new Error('should not be called'));
      }, () => {
        done();
      });

    source$.subscribe(subject$);
  });

  it('should be usable as an Observer of a finite delayed Observable', (done) => {
    const source$ = of(1, 2, 3).pipe(delay(50));
    const subject$ = new Subject();

    const expected = [1, 2, 3];

    subject$.subscribe(
      function (x) {
        expect(x).toEqual(expected.shift());
      }, (x) => {
        done(new Error('should not be called'));
      }, () => {
        done();
      });

    source$.subscribe(subject$);
  });

  it('should throw ObjectUnsubscribedError when emit after unsubscribed', () => {
    const subject$ = new Subject();
    subject$.unsubscribe();

    expect(() => {
      subject$.next('a');
    }).toThrow(ObjectUnsubscribedError);

    expect(() => {
      subject$.error('a');
    }).toThrow(ObjectUnsubscribedError);

    expect(() => {
      subject$.complete();
    }).toThrow(ObjectUnsubscribedError);
  });

  it('should not next after completed', () => {
    const subject$ = new Subject<string>();
    const results: string[] = [];
    subject$.subscribe(x => results.push(x), null, () => results.push('C'));
    subject$.next('a');
    subject$.complete();
    subject$.next('b');
    expect(results).toEqual(['a', 'C']);
  });

  it('should not next after error', () => {
    const error = new Error('wut?');
    const subject$ = new Subject<string>();
    const results: string[] = [];
    subject$.subscribe(x => results.push(x), (err) => results.push(err));
    subject$.next('a');
    subject$.error(error);
    subject$.next('b');
    expect(results).toEqual(['a', error]);
  });

  describe('asObservable', () => {
    it('should hide subject$', () => {
      const subject$ = new Subject();
      const observable$ = subject$.asObservable();

      expect(subject$).not.toEqual(observable$);

      expect(observable$ instanceof Observable).toBeTruthy();
      expect(observable$ instanceof Subject).toBeFalsy();
    });
  });
});
