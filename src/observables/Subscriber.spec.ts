import { Subscriber } from './Subscriber';


/** @test {Subscriber} */
describe.skip('Subscriber', () => {
  it('should ignore next messages after unsubscription', () => {
    let times = 0;

    const sub = new Subscriber({
      next() { times += 1; }
    });

    sub.next();
    sub.next();
    sub.unsubscribe();
    sub.next();

    expect(times).toEqual(2);
  });

  it('should wrap unsafe observers in a safe subscriber', () => {
    const observer = {
      next(x: any) { /* noop */ },
      error(err: any) { /* noop */ },
    };

    const subscriber = new Subscriber(observer);
    expect((subscriber as any).destination).not.toEqual(observer);
  });

  it('should ignore error messages after unsubscription', () => {
    let times = 0;
    let errorCalled = false;

    const sub = new Subscriber({
      next() { times += 1; },
      error() { errorCalled = true; }
    });

    sub.next();
    sub.next();
    sub.unsubscribe();
    sub.next();
    sub.error();

    expect(times).toEqual(2);
    expect(errorCalled).toBeFalsy();
  });

  it('should ignore complete messages after unsubscription', () => {
    let times = 0;
    let completeCalled = false;

    const sub = new Subscriber({
      next() { times += 1; },
      complete() { completeCalled = true; }
    });

    sub.next();
    sub.next();
    sub.unsubscribe();
    sub.next();
    sub.complete();

    expect(times).toEqual(2);
    expect(completeCalled).toBeFalsy();
  });

  it('should not be closed when other subscriber with same observer instance completes', () => {
    const observer = {
      next: () => { /*noop*/ }
    };

    const sub1 = new Subscriber(observer);
    const sub2 = new Subscriber(observer);

    sub2.complete();

    expect(sub1.subscription.closed).toBeFalsy();
    expect(sub2.subscription.closed).toBeTruthy();
  });

  it('should call complete observer without any arguments', () => {
    let argument: Array<any> | null = null;

    const observer = {
      complete: (...args: Array<any>) => {
        argument = args;
      }
    };

    const sub1 = new Subscriber(observer);
    sub1.complete();

    expect(argument.length).toBe(0);
  });
});
