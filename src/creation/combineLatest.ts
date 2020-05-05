import { Observable } from '../observables/Observable';
import { PartialObserver, Observer } from '../observables/types';
import { Subscription } from '../observables/Subscription';

class CombineCounter {
  constructor(
    private all: number,
    public started = 0,
    public ended = 0,
  ) { }

  isFullfilled() {
    return this.all === this.started;
  }

  isCompleted() {
    return this.all === this.ended;
  }
}

function createSourceSubscriber<I>(
  currentValue: I[],
  index: number,
  observer: PartialObserver<I[]>,
  combineCounter: CombineCounter,
): Observer<I> {
  let isStarted = false;

  return {
    next: (v: I) => {
      currentValue[index] = v;
      if (!isStarted) {
        isStarted = true;
        combineCounter.started++;
      }

      if (combineCounter.isFullfilled()) {
        observer.next(currentValue.slice());
      }
    },
    error: err => observer.error(err),
    complete: () => {
      combineCounter.ended++;
      if (combineCounter.isCompleted()) {
        observer.complete();
      }
    }
  }
}

export function combineLatest<S extends Observable<I>, I>(sources: S[]): Observable<I[]> {
  return new Observable<I[]>(observer => {
    const combineCounter = new CombineCounter(sources.length);
    const sub = new Subscription();
    const currentValue: I[] = Array(sources.length);


    sources.forEach((source, i) => {
      const sourceSub = source.subscribe(
        createSourceSubscriber(currentValue, i, observer, combineCounter)
      );
      sub.add(sourceSub);
    });
    return () => sub.unsubscribe();
  });
}