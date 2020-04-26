import { noop } from './noop';
import { Observer } from '../observables/types';

export function emptyObserver<T>(): Observer<T> {
  return {
    next: noop,
    error: noop,
    complete: noop,
  };
}