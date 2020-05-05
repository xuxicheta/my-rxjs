import { hot } from '../testing/hot';
import { combineLatest } from './combineLatest';
import { expectObservable, splitValues } from '../testing';

/** @test {combineLatest} */
describe('static combineLatest', () => {
  it('should combineLatest the provided observables', (done) => {
    const firstSource =  hot('----a----b----c----|');
    const secondSource = hot('--d--e--f--g--|');
    const expected =         '----uv--wx-y--z----|';
    const expectedValues = { u: 'ad', v: 'ae', w: 'af', x: 'bf', y: 'bg', z: 'cg' };

    const combined = combineLatest([firstSource, secondSource]);

    expectObservable(combined)
      .toBe(expected, splitValues(expectedValues))
      .then(result => {
        expect(result).toBeTruthy();
        done();
      });
  });


  it('should accept array of observables', () => {
    const firstSource = hot('----a----b----c----|');
    const secondSource = hot('--d--e--f--g--|');
    const expected = '----uv--wx-y--z----|';
    const expectedValues = { u: 'ad', v: 'ae', w: 'af', x: 'bf', y: 'bg', z: 'cg' };

    const combined = combineLatest([firstSource, secondSource]);

    return expectObservable(combined).toBeMatchWithSplit(expected, expectedValues);
  });


  it('should work with empty and error', () => {
    const e1 = hot('----------|'); // empty
    const e2 = hot('------#', undefined, 'sha z bot!'); // error
    const expected = '------#';


    return expectObservable(combineLatest([e1, e2])).toBe(expected, null, 'sha z bot!')
      .then(result => {
        expect(result).toBeTruthy();
      });
  });

  it('should work with error and empty', () => {
    const e1 = hot('-----#'); // error
    const e2 = hot('----------|'); // empty
    const expected = '-----#';

    return expectObservable(combineLatest([e1, e2])).toBeMatch(expected);
  });

  it('should work with hot and throw', () => {
    const e1 = hot('-a---b--c--|', { a: 1, b: 2, c: 3 });
    const e2 = hot('----#', null, 'baz i nga');
    const expected = '----#';

    return expectObservable(combineLatest([e1, e2])).toBeMatch(expected)
  });
});
