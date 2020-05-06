import { Observable } from '../observables/Observable';
import { PartialObserver, Observer } from '../observables/types';
import { Subscription } from '../observables/Subscription';

class ForkJoinCounter {
  constructor(
    private all: number,
    public ended = 0,
  ) { }

  isCompleted() {
    return this.all === this.ended;
  }
}

function createSourceSubscriber<I>(
  currentValue: I[],
  index: number,
  observer: PartialObserver<I[]>,
  combineCounter: ForkJoinCounter,
): Observer<I> {
  return {
    next: (v: I) => {
      currentValue[index] = v;
    },
    error: err => observer.error(err),
    complete: () => {
      combineCounter.ended++;
      if (combineCounter.isCompleted()) {
        const valueLength = currentValue.filter(() => true).length;
        if (valueLength === combineCounter.ended) {
          observer.next(currentValue.slice());
        }
        observer.complete();
      }
    }
  }
}

export function forkJoin<S extends Observable<I>, I>(sources?: S[]): Observable<I[]> {
  return new Observable<I[]>(observer => {
    if (!sources || sources.length === 0) {
      observer.complete();
      return;
    }

    const counter = new ForkJoinCounter(sources.length);
    const sub = new Subscription();
    const currentValue: I[] = Array(sources.length);


    sources.forEach((source, i) => {
      const sourceSub = source.subscribe(
        createSourceSubscriber(currentValue, i, observer, counter)
      );
      sub.add(sourceSub);
    });
    return sub;
  });
}