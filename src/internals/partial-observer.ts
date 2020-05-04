import { PartialObserver, Observer } from '../observables/types';
import { emptyObserver } from './empty-observer';

export function partialObserver<T>(
  nextOrObserver?: PartialObserver<T> | ((x: T) => void) | null,
  error?: ((e: any) => void) | null,
  complete?: () => void
): Observer<T> {
  if (nextOrObserver && typeof nextOrObserver === 'object') {
    return objectObserver(nextOrObserver);
  }
  return functionObserver(nextOrObserver, error, complete)
}

function objectObserver<T>(nextOrObserver: PartialObserver<T>): Observer<T> {
  if (nextOrObserver.next && nextOrObserver.error && nextOrObserver.complete) {
    return nextOrObserver as Observer<T>;
  } else {
    return {
      ...emptyObserver<T>(),
      ...nextOrObserver
    };
  }
}

function functionObserver<T>(
  nextOrObserver?: PartialObserver<T> | ((x: T) => void) | null,
  error?: ((e: any) => void) | null,
  complete?: () => void
) {
  const empty = emptyObserver<T>();
  return {
    next: nextOrObserver as ((value: T) => void) || empty.next,
    error: error || empty.error,
    complete: complete || empty.complete,
  }
}