import { Observable } from '../observables/Observable';
import { Subscription } from '../observables/Subscription';
import { isDeepStrictEqual } from 'util';

export function expectObservable<T>(source: Observable<T>) {
  return new ExpectedObservable(source);
}

export function splitValues(expectedValues: Record<string, string>) {
  const result = {};
  Object.entries(expectedValues).forEach(([key, value]) => {
    result[key] = value.split('');
  })
  return result;
}

export class Timer {
  public timeSlot = -1;
  private interval: NodeJS.Timeout;

  constructor(
    private period = 40,
    private cb = () => {},
  ) {
    this.interval = setInterval(
      () => {
        this.timeSlot += 1;
        this.cb();
      },
      this.period,
    );
  }

  stop() {
    clearInterval(this.interval);
  }
}

class ExpectedObservable<T> {
  results: Promise<(string | T)[]>;
  expectedString: string;
  expectedValues: object;
  expectedError?: any;
  error: any;
  sub: Subscription;

  constructor(
    private source: Observable<T>,
  ) {
    this.results = this.collectResults();
  }



  private checkIsMatched(results: (string | T)[]) {
    const { expectedString, expectedError, error, expectedValues } = this;

    const expectedArray = expectedString.split('');
    let isMatched = expectedArray.every((expectedRawResult, i) => {
      const expectedResult = expectedValues && expectedValues[expectedRawResult] || expectedRawResult
      return isDeepStrictEqual(expectedResult, results[i])
    });
    if (expectedError) {
      isMatched = isMatched && isDeepStrictEqual(error, expectedError)
    }
    return isMatched;
  }

  private collectResults(): Promise<(string | T)[]> {
    const results: (string | T)[] = [];

    return new Promise<(string | T)[]>((resolve, reject) => {
      const timer = new Timer();
      this.sub = this.source.subscribe({
        next: (v) => {
          results[timer.timeSlot] = v;
        },
        error: (err) => {
          results[Math.max(0, timer.timeSlot)] = '#';
          this.error = err;
          timer.stop();
          resolve(results);
        },
        complete: () => {
          results[timer.timeSlot] = '|';
          timer.stop();
          resolve(results);
        }
      });
    })
      .then(this.coalesceResults)
  }

  private coalesceResults(results: (string | T)[]): (string | T)[] {
    for (let i = 0; i < results.length; i++) {
      if (!(i in results)) {
        results[i] = '-';
      }
    }
    return results;
  }

  async toBe(expectedString: string, expectedValues?: object, expectedError?: any): Promise<boolean> {
    this.expectedString = expectedString;
    this.expectedValues = expectedValues;
    this.expectedError = expectedError;

    return this.checkIsMatched(await this.results);
  }

  toBeMatch(expectedString: string, expectedValues?: Record<string, string>, expectedError?: any) {
    return expect(this.toBe(expectedString, expectedValues, expectedError)).resolves.toBeTruthy();
  }

  toBeMatchWithSplit(expectedString: string, expectedValues: Record<string, string>, expectedError?: any) {
    return expect(this.toBe(expectedString, splitValues(expectedValues), expectedError)).resolves.toBeTruthy();
  }
}