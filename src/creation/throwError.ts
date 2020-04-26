import { Observable } from '../observables/Observable';

export function throwError(error: any): Observable<never> {
  return new Observable(observer => {
    observer.error(error);
  })
}
