/* tslint:disable: ban-types */
import { Observable } from '../observables/Observable';
import { PartialObserver } from '../observables/types';
import { AsyncSubject } from '../observables/AsyncSubject';


export function bindNodeCallback<T>(callbackFunc: Function): (...args: any[]) => Observable<T> {
  return function bindNodeCallbackFn(this: any, ...args: any[]) {
    let asyncSubject: AsyncSubject<T>;
    return new Observable((observer: PartialObserver<T>) => {
      if (asyncSubject) {
        return asyncSubject.subscribe(observer);
      }

      asyncSubject = new AsyncSubject<T>();

      try {
        callbackFunc.apply(this, [...args, (err, cbArg: T) => {
          if (err) {
            asyncSubject.error(err);
            return;
          }

          asyncSubject.next(cbArg);
          asyncSubject.complete();
        }])
      } catch (e) {
        (asyncSubject as any).hasCompleted = false;
        asyncSubject.error(e);
      }

      return asyncSubject.subscribe(observer);
    });
  }
}