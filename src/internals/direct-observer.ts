import { PartialObserver } from '../observables/types';

export function directObserver<T>(observer: PartialObserver<T>) {
  return {
    next: (v: T) => observer.next(v),
    error: (err: any) => observer.error(err),
    complete: () => observer.complete(),
  }
}