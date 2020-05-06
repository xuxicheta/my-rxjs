import { empty, EMPTY } from './empty';
import { expectObservable } from '../testing';

/** @test {empty} */
describe('empty', () => {
  it('empty should create a cold observable with only complete', () => {
    const expected = '|';
    const e1 = empty();
    return expectObservable(e1).toBeMatch(expected);
  });

  it('should return the same instance EMPTY', () => {
    const s1 = empty();
    const s2 = empty();
    expect(s1).toEqual(s2);
  });

  it('should be synchronous by default', () => {
    const source = empty();
    let hit = false;
    source.subscribe({
      complete() { hit = true; }
    });
    expect(hit).toBeTruthy();
  });

  it('should equal EMPTY', () => {
    expect(empty()).toEqual(EMPTY);
  });
});
