import { Observable } from '../observables/Observable';
import { runOnValues } from './run-on-values';

export function cold(sourceString: string, values?: object, error?: any) {
  return new Observable(observer => {
    runOnValues(observer, sourceString, values, error);
  });
}