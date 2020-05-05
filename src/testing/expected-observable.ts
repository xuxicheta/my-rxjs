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

class ExpectedObservable<T> {
  results: Promise<(string | T)[]>;
  expectedString: string;
  expectedValues: object;
  expectedError?: any;
  error: any;
  timeSlot = 0;
  interval: NodeJS.Timeout;
  sub: Subscription;

  constructor(private source: Observable<T>) {
    this.results = this.collectResults();
  }

  private startTimer() {
    this.interval = setInterval(() => {
      this.timeSlot++
    }, 30);
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
    this.startTimer();

    return new Promise<(string | T)[]>((resolve, reject) => {
      this.sub = this.source.subscribe({
        next: (v) => {
          results[this.timeSlot] = v;
        },
        error: (err) => {
          results[this.timeSlot] = '#';
          this.error = err;
          clearInterval(this.interval);
          resolve(results);
        },
        complete: () => {
          results[this.timeSlot] = '|';
          clearInterval(this.interval);
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

  toBeTruthyWith(expectedString: string, expectedValues?: Record<string, string>, expectedError?: any) {
    const values = expectedValues ? splitValues(expectedValues) : undefined;
    return expect(this.toBe(expectedString, values, expectedError)).resolves.toBeTruthy();
  }
}