import { PartialObserver, MonoTypeOperatorFunction } from '../observables/types';
import { Observable } from '../observables/Observable';
import { partialObserver } from '../internals/partial-observer';

export function tap<T>(
  nextOrObserver?: PartialObserver<T> | ((x: T) => void) | null,
  error?: ((e: any) => void) | null,
  complete?: () => void
): MonoTypeOperatorFunction<T> {
  const tapObserver = partialObserver(nextOrObserver, error, complete);

  return (input$: Observable<T>) => {
    return new Observable(observer => {
      const sub = input$.subscribe({
        next(v) {
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
      });

      return () => sub.unsubscribe();
    });
  }
}