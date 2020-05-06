import { Observable } from '../observables/Observable';
import { PartialObserver } from '../observables/types';
import { Subscription } from '../observables/Subscription';
import { directObserver } from '../internals';

function concatSubscription<T>(observer: PartialObserver<T>, sources: Observable<T>[], rootSub: Subscription): Subscription {
  const source = sources.shift();

  if (!source) {
    return;
  }

  const sub = source.subscribe({
    ...directObserver(observer),
    next: v => {
      observer.next(v);
    },
    complete: () => {
      const nextSub = concatSubscription(observer, sources, rootSub);
      if (!nextSub) {
        observer.complete();
      }
    }
  });

  rootSub.add(sub);
  return sub;
}

export function concat<S extends Observable<I>, I>(...sources: S[]) {
  return new Observable<I>(observer => {
    const rootSub = new Subscription();
    concatSubscription(observer, sources, rootSub);
    return rootSub;
  });
}