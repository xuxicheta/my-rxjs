import { Observable } from '../observables/Observable';
import { EMPTY } from './empty';

export function defer<T>(observableFactory: () => Observable<T>) {
  return new Observable<T>(observer => {
    let observable: Observable<T>;
    try {
      observable = observableFactory();
    } catch (err) {
      observer.error(err);
      return undefined;
    }
    return (observable || EMPTY).subscribe(observer );
  });
}