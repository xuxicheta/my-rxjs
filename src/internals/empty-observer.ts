import { noop } from './noop';
import { Observer } from '../observables/types';

export function emptyObserver<T>(): Observer<T> {
  return {
    next: noop,
    error: function emptyError(e) {
      console.warn(e);
    },
    complete: noop,
  };
}