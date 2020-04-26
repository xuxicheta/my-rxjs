import { PartialObserver, Observer } from '../observables/types';
import { emptyObserver } from './empty-observer';

export function partialObserver<T>(
  nextOrObserver?: PartialObserver<T> | ((x: T) => void) | null,
  error?: ((e: any) => void) | null,
  complete?: () => void
): Observer<T> {
  if (typeof nextOrObserver === 'object') {
    return {
      ...emptyObserver<T>(),
      ...nextOrObserver
    };
  } else {
    const empty = emptyObserver<T>();
    return {
      next: nextOrObserver as ((value: T) => void) || empty.next,
      error: error || empty.error,
      complete: complete || empty.complete,
    }
  }
}