import { Subject } from '../observables/Subject';
import { runOnValues } from './run-on-values';

export function hot(sourceString: string, values?: object, error?: any) {
  const subject = new Subject<string>();
  setTimeout(() => runOnValues(subject, sourceString, values, error));
  return subject;
}