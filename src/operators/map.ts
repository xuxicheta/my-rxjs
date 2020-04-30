import { Observable } from '../observables/Observable';
import { OperatorFunction, PartialObserver, Observer } from '../observables/types';

function createMapSubscriber<T, R>(
  observer: PartialObserver<R>,
  project: (value: T, index: number) => R,
  thisArg?: any,
): Observer<T> {
  let count = 0;

  return {
    next(v: T) {
      let result: R;
      try {
        result = project.call(thisArg, v, count++);
      } catch (err) {
        observer.error(err);
        return;
      }
      observer.next(result);
    },
    error: err => observer.error(err),
    complete: () => observer.complete(),
  }
}

export function map<T, R>(project: (value: T, index: number) => R, thisArg?: any): OperatorFunction<T, R> {
  return (input$: Observable<T>) => {
    return new Observable(observer => {
      const sub = input$.subscribe(createMapSubscriber(observer, project, thisArg));
      return () => sub.unsubscribe();
    });
  }
}