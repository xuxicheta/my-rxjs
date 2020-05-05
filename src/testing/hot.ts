import { Subject } from '../observables/Subject';

export function hot(sourceString: string, values?: object, error?: any) {
  const subject = new Subject<string>();
  const sourceArray = sourceString.split('');
  let timeSlot = -1;
  const interval = setInterval(() => {
    timeSlot++;
    const k = sourceArray[timeSlot];
    switch (k) {
      case '-': return;
      case '|':
        subject.complete();
        clearInterval(interval);
        break;
      case '#':
        subject.error(error);
        clearInterval(interval);
        break;
      default:
        const value = (values && values[k]) || k;
        subject.next(value);
    }
  }, 30)

  return subject;
}