import { Observer } from '../observables/types';

export function directObserver<T>(observer: Observer<T>) {
  return {
    next: (v: T) => observer.next(v),
    error: err => observer.error(err),
    complete: () => observer.complete(),
  }
}