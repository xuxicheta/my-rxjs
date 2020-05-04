import { ReplaySubject } from './ReplaySubject';
import { Subject } from './Subject';
import { of } from '../creation/of';

/** @test {ReplaySubject} */
describe('ReplaySubject', () => {
  it('should extend Subject', () => {
    const subject = new ReplaySubject();
    expect(subject).toBeInstanceOf(Subject);
  });

  it('should add the observer before running subscription code', () => {
    const subject = new ReplaySubject<number>();
    subject.next(1);
    const results: number[] = [];

    subject.subscribe((value) => {
      results.push(value);
      if (value < 3) {
        subject.next(value + 1);
      }
    });

    expect(results).toEqual([1, 2, 3]);
  });

  it('should replay values upon subscription', (done) => {
    const subject = new ReplaySubject<number>();
    const expects = [1, 2, 3];
    let i = 0;
    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.subscribe((x: number) => {
      expect(x).toEqual(expects[i++]);
      if (i === 3) {
        subject.complete();
      }
    }, (err: any) => {
      done(new Error('should not be called'));
    }, () => {
      done();
    });
  });

  it('should replay values and complete', (done) => {
    const subject = new ReplaySubject<number>();
    const expects = [1, 2, 3];
    let i = 0;
    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.complete();
    subject.subscribe((x: number) => {
      expect(x).toEqual(expects[i++]);
    }, null, done);
  });

  it('should replay values and error', (done) => {
    const subject = new ReplaySubject<number>();
    const expects = [1, 2, 3];
    let i = 0;
    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.error('fooey');
    subject.subscribe((x: number) => {
      expect(x).toEqual(expects[i++]);
    }, (err: any) => {
      expect(err).toEqual('fooey');
      done();
    });
  });

  it('should only replay values within its buffer size', (done) => {
    const subject = new ReplaySubject<number>(2);
    const expects = [2, 3];
    let i = 0;
    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.subscribe((x: number) => {
      expect(x).toEqual(expects[i++]);
      if (i === 2) {
        subject.complete();
      }
    }, (err: any) => {
      done(new Error('should not be called'));
    }, () => {
      done();
    });
  });

  it('should be an Observer which can be given to Observable.subscribe', () => {
    const source = of(1, 2, 3, 4, 5);
    const subject = new ReplaySubject<number>(3);
    let results: (number | string)[] = [];

    subject.subscribe(x => results.push(x), null, () => results.push('done'));

    source.subscribe(subject);

    expect(results).toEqual([1, 2, 3, 4, 5, 'done']);

    results = [];

    subject.subscribe(x => {
      results.push(x);
    }, null, () => {
      results.push('done');
    });

    expect(results).toEqual([3, 4, 5, 'done']);
  });
});
