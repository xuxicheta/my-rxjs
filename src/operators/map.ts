import { Observable } from '../observables/Observable';
import { OperatorFunction } from '../observables/types';

export function map<T, R>(project: (value: T, index: number) => R, thisArg?: any): OperatorFunction<T,R> {
  return (input$: Observable<T>) => {
    return new Observable(observer => {
      let count = 0;

      const sub = input$.subscribe({
        next(v) {
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
      });

      return () => sub.unsubscribe();
    });
  }
}