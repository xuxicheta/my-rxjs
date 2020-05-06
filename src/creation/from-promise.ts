import { Observable } from '../observables/Observable';
import { PartialObserver } from '../observables/types';

export function fromPromise<T>(source: PromiseLike<T>): Observable<T> {
  return new Observable((observer: PartialObserver<T>) => {
    let isActive = true;
    source
      .then(
        result => {
          if (isActive) {
            observer.next(result);
            observer.complete();
          }
        },
        err => {
          if (isActive) {
            observer.error(err);
          }
        }
      );
    return () => isActive = false;
  });
}