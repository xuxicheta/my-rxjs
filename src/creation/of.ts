import { Observable } from '../observables/Observable';

export function of<T>(value: T): Observable<T> {
  return new Observable(observer => {
    observer.next(value);
    observer.complete();
  });
}
