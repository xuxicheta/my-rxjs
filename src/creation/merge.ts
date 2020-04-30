import { Observable } from '../observables/Observable';
import { PartialObserver, Observer } from 'src/observables/types';
import { Subscription } from '../observables/Subscription';

class CompleterCounter {
  constructor(
    private all: number,
    public current = 0,
  ) { }

  get isOff() {
    return this.all <= this.current;
  }
}

function createDirectSubscriber<T>(observer: PartialObserver<T>, source$: Observable<T>, completedCounter: CompleterCounter): Observer<T> {
  return {
    next: (v: T) => observer.next(v),
    error: err => observer.error(err),
    complete: () => {
      completedCounter.current++;
      if (completedCounter.isOff) {
        observer.complete();
      }
    }
  }
}

export function merge<T>(...obs: Observable<T>[]): Observable<T> {
  return new Observable<T>(observer => {
    const completedCounter = new CompleterCounter(obs.length);
    const sub = new Subscription();
    obs.forEach(ob$ => {
      const iSub = ob$.subscribe(
        createDirectSubscriber(observer, ob$, completedCounter)
      );
      sub.add(iSub);
    });
    return () => sub.unsubscribe();
  });
}
