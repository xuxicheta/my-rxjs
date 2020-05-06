import { forkJoin } from './forkJoin';
import { hot, cold, expectObservable } from '../testing';

/** @test {forkJoin} */
describe('forkJoin', () => {
  it('forkJoin should join the last values of the provided observables into an array', () => {
    const e1 = forkJoin([
      hot('-a--b-----c-d-e-|'),
      hot('--------f--g-h-i--j-|'),
      cold('--1--2-3-4---|'),
    ]);
    const expected = '--------------------x|';

    return expectObservable(e1).toBeMatch(expected, { x: ['e', 'j', '4'] });
  });


  it('should accept single observable', () => {
    const e1 = forkJoin(
      [hot('--a--b--c--d--|')]
    );
    const expected = '--------------x|';

    return expectObservable(e1).toBeMatch(expected, { x: ['d'] });
  });

  describe('forkJoin([input1, input2, input3])', () => {
    it('should join the last values of the provided observables into an array', () => {
      const e1 = forkJoin([
        hot('--a--b--c--d--|'),
        hot('b|'),
        hot('--1--2--3--|')
      ]);
      const expected = '--------------x|';

      return expectObservable(e1).toBeMatch(expected, { x: ['d', 'b', '3'] });
    });


    it('should complete when all sources are empty', () => {
      const e1 = forkJoin([
        hot('--------------|'),
        hot('---------|')
      ]);
      const expected = '--------------|';

      return expectObservable(e1).toBeMatch(expected);
    });


    it('should complete if source is not provided', () => {
      const e1 = forkJoin();
      const expected = '|';

      return expectObservable(e1).toBeMatch(expected);
    });

    it('should complete if sources list is empty', () => {
      const e1 = forkJoin([]);
      const expected = '|';

      return expectObservable(e1).toBe(expected);
    });

    it('should raise error when any of source raises error with empty observable', () => {
      const e1 = forkJoin([
        hot('------#'),
        hot('---------|')]);
      const expected = '------#';

      return expectObservable(e1).toBeMatch(expected);
    });

  });
});
