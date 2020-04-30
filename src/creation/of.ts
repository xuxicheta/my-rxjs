import { Observable } from '../observables/Observable';

export function of<T>(...values: T[]): Observable<T> {
  return new Observable(observer => {
    values.forEach(value => observer.next(value));
    observer.complete();
  });
}
