import { PartialObserver, MonoTypeOperatorFunction, Observer } from '../observables/types';
import { Observable } from '../observables/Observable';
import { partialObserver } from '../internals/partial-observer';

function createTapSubscriber<T, R>(
  tapObserver: Observer<T>,
  observer: PartialObserver<T>,
): Observer<T> {
  return {
    next(v: T) {
      tapObserver.next(v);
      observer.next(v);
    },
    error(err) {
      tapObserver.error(err);
      observer.error(err);
    },
    complete() {
      tapObserver.complete();
      observer.complete();
    }
  }
}

export function tap<T>(
  nextOrObserver?: PartialObserver<T> | ((x: T) => void) | null,
  error?: ((e: any) => void) | null,
  complete?: () => void
): MonoTypeOperatorFunction<T> {
  const tapObserver = partialObserver(nextOrObserver, error, complete);

  return (input$: Observable<T>) => {
    return new Observable(observer => {
      const sub = input$.subscribe(createTapSubscriber(tapObserver, observer));
      return () => sub.unsubscribe();
    });
  }
}