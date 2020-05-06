import { cold, expectObservable, hot } from '../testing';
import { defer } from './defer';

/** @test {defer} */
describe('defer', () => {
  it('defer(() => Observable.of(a, b, c)) should defer the creation of a simple Observable', () => {
    const expected =    '-a--b--c--|';
    const e1 = defer(() => cold('-a--b--c--|'));
    return expectObservable(e1).toBeMatch(expected);
  });

  it('should create an observable from the provided observable factory', () => {
    const source = hot('--a--b--c--|');
    const expected =   '--a--b--c--|';

    const e1 = defer(() => source);

    return expectObservable(e1).toBeMatch(expected);
  });

  it('should create an observable from completed', () => {
    const source = hot('|');
    const expected =   '|';

    const e1 = defer(() => source);

    return expectObservable(e1).toBeMatch(expected);
  });


  it('should create an observable from error', () => {
    const source = hot('#');
    const expected =   '#';

    const e1 = defer(() => source);

    return expectObservable(e1).toBeMatch(expected);
  });

  it('should create an observable when factory throws', () => {
    const e1 = defer(() => {
      throw new Error();
    });
    const expected = '#';

    return expectObservable(e1).toBeMatch(expected);
  });
});
