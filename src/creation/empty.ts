import { Observable } from '../observables/Observable';

// tslint:disable-next-line: rxjs-finnish
export const EMPTY = new Observable<never>(subscriber => subscriber.complete());

export function empty() {
  return EMPTY;
}