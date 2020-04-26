import { Observable } from './Observable';

export interface Unsubscribable {
  unsubscribe(): void;
}

// tslint:disable-next-line: ban-types
export type TeardownLogic = Unsubscribable | void | Function;

export interface Subscribable<T> {
  subscribe(observer?: PartialObserver<T>): TeardownLogic;
}

export interface SubscriptionLike extends Unsubscribable {
  readonly closed: boolean;
  unsubscribe(): void;
}

export interface Observer<T> {
  closed?: boolean;
  next: (value: T) => void;
  error: (err: any) => void;
  complete: () => void;
}

export interface NextObserver<T> {
  closed?: boolean;
  next: (value: T) => void;
  error?: (err: any) => void;
  complete?: () => void;
}

export interface ErrorObserver<T> {
  closed?: boolean;
  next?: (value: T) => void;
  error: (err: any) => void;
  complete?: () => void;
}

export interface CompletionObserver<T> {
  closed?: boolean;
  next?: (value: T) => void;
  error?: (err: any) => void;
  complete: () => void;
}

export type PartialObserver<T> = NextObserver<T> | ErrorObserver<T> | CompletionObserver<T>;

export interface Observer<T> {
  closed?: boolean;
  next: (value: T) => void;
  error: (err: any) => void;
  complete: () => void;
}

export type UnaryFunction<T, R> = (source: T) => R;
export interface OperatorFunction<T, R> extends UnaryFunction<Observable<T>, Observable<R>> { }
export interface MonoTypeOperatorFunction<T> extends OperatorFunction<T, T> { }


