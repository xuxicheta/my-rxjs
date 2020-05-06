import { concat } from './concat';
import { expectObservable, hot, cold } from '../testing';

/** @test {concat} */
describe('static concat', () => {
  it('should emit elements from multiple sources', () => {
    const e1 =  cold('-a-b-c-|');
    const e2 =  cold('-0-1-|');
    const e3 =  cold('-w-x-y-z-|');
    const expected = '-a-b-c---0-1---w-x-y-z-|';

    return expectObservable(concat(e1, e2, e3)).toBeMatch(expected);
  });

   it('should concat the same cold observable multiple times', () => {
    const inner =  cold('--i-j-k-l-|                              ');
    const expected =    '--i-j-k-l----i-j-k-l----i-j-k-l----i-j-k-l-|';

    const result = concat(inner, inner, inner, inner);

     return expectObservable(result).toBeMatch(expected);
  });



  it('should complete without emit if both sources are empty', () => {
    const e1 =   cold('--|');
    const e2 =   cold(  '----|');
    const expected =  '-------|';

    return expectObservable(concat(e1, e2)).toBeMatch(expected);
  });

  it('should raise error when first source is empty, second source raises error', () => {
    const e1 =   cold('--|');
    const e2 =   cold(   '----#');
    const expected =  '-------#';

    return expectObservable(concat(e1, e2)).toBeMatch(expected);
  });

  it('should raise error when first source raises error, second source is empty', () => {
    const e1 =   cold('---#');
    const e2 =   cold('----|');
    const expected =  '---#';

    return expectObservable(concat(e1, e2)).toBeMatch(expected);
  });

  it('should raise first error when both source raise error', () => {
    const e1 =   cold('---#');
    const e2 =   cold('------#');
    const expected =  '---#';

    return expectObservable(concat(e1, e2)).toBeMatch(expected);
  });

  it('should concat if first source emits once, second source is empty', () => {
    const e1 =   cold('--a--|');
    const e2 =   cold(      '--------|');
    const expected =  '--a-----------|';

    return expectObservable(concat(e1, e2)).toBeMatch(expected);
  });

  it('should return passed observable if no scheduler was passed', () => {
    const source = cold('--a---b----c---|');
    const result = concat(source);

    return expectObservable(result).toBeMatch('--a---b----c---|');
  });

});
