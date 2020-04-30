import { Observer, PartialObserver, MonoTypeOperatorFunction } from '../observables/types';
import { Observable } from '../observables/Observable';

function createDelaySubscriber<T>(
  delayValue: number | Date,
  observer: PartialObserver<T>,
  queue: number[],
): Observer<T> {
  const delayFn = createDelayFn(delayValue);

  return {
    next(v: T) {
      const plan = delayFn(() => {
        observer.next(v);
        queue.shift();
      });
      queue.push(plan);
    },
    error: err => observer.error(err),
    complete: () => observer.complete(),
  }
}

function createDelayFn(delayValue: number | Date) {
  let absDelay = 0;
  if (typeof delayValue === 'number') {
    absDelay = delayValue;
  }
  if (delayValue instanceof Date && !isNaN(+delayValue)) {
    absDelay = Math.max(0, +delayValue - Date.now())
  }
  return (cb: TimerHandler) => setTimeout(cb, Math.abs(absDelay));
}


export function delay<T>(
  delayValue: number | Date,
): MonoTypeOperatorFunction<T> {
  return (input$: Observable<T>) => {
    return new Observable(observer => {
      const queue: number[] = [];
      const sub = input$.subscribe(createDelaySubscriber(delayValue, observer, queue));
      return () => {
        sub.unsubscribe();
        queue.forEach(plan => clearTimeout(plan));
      }
    });
  }
}