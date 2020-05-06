import { Observer } from '../observables/types';
import { Timer } from './expected-observable';

export function runOnValues<T>(subscriber: Observer<T>, sourceString: string, values?: Record<string, any>, error?: any) {
  const timer = new Timer(40, () => {
    const k = sourceString[timer.timeSlot];
    switch (k) {
      case '-':
        return;
      case '|':
        subscriber.complete();
        timer.stop();
        return;
      case '#':
        subscriber.error(error);
        timer.stop();
        return;
      default:
        const value = (values && values[k]) || k;
        subscriber.next(value);
    }
  })
}