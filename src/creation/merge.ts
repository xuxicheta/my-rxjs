import { Observable } from '../observables/Observable';
import { PartialObserver, Observer } from 'src/observables/types';
import { Subscription } from '../observables/Subscription';
import { directObserver } from '../internals/direct-observer';

class CompleterCounter {
  constructor(
    private all: number,
    public current = 0,
  ) { }

  get isOff() {
    return this.all <= this.current;
  }
}

function createDirectSubscriber<T>(observer: PartialObserver<T>, completedCounter: CompleterCounter): Observer<T> {
  return {
    ...directObserver(observer),
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
        createDirectSubscriber(observer, completedCounter)
      );
      sub.add(iSub);
    });
    return () => sub.unsubscribe();
  });
}
