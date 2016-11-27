/** Class representing a semaphore */
export default class Semaphore {
  private promiseResolvers: Array<(v: boolean) => void>;

  /**
   * Creates a semaphore.
   * @param {number} permits The number of permits, i.e. things being allowed to run in parallel.
   * To create a lock that only lets one thing run at a time, set this to 1. This number can also be negative.
   */
  constructor(private permits: number) {}

  /**
   * Returns a promise used to wait for a permit to become available.
   * @return {Promise} A promise that gets resolved when execution is allowed to proceed.
   */
  async wait(): Promise<boolean> {
    if (this.permits > 0) {
      this.permits -= 1;
      return Promise.resolve(true);
    }
    return new Promise<boolean>(resolver => this.promiseResolvers.push(resolver));
  }

  /**
   * Same as wait except the promise returned gets resolved with false if no permit becomes available in time.
   * @param {number} milliseconds The time spent waiting before the wait is aborted.
   * @return {Promise} A promise that gets resolved with true when execution is allowed to proceed or
   * false if the time given elapses before a permit becomes available.
   */
  async waitFor(milliseconds: number): Promise<boolean> {
    if (this.permits > 0) {
      this.permits -= 1;
      return Promise.resolve(true);
    }

    let resolver: (v: boolean) => void;
    const promise = new Promise<boolean>(r => {
      resolver = r;
    });

    this.promiseResolvers.push(resolver);

    setTimeout(() => {
      const index = this.promiseResolvers.indexOf(resolver);
      if (index !== -1) {
        this.promiseResolvers.splice(index, 1);
      }
      resolver(false);
    }, milliseconds);

    return promise;
  }

  /**
   * Synchronous function that tries to acquire a permit and returns true if successful, false otherwise.
   * @return {boolean} Whether a permit could be acquired.
   */
  tryAcquire(): boolean {
    if (this.permits > 0) {
      this.permits -= 1;
      return true;
    }
    return false;
  }

  /**
   * Increases the number of permits by one. If there are other functions waiting, one of them will
   * continue to execute in a future iteration of the event loop.
   */
  signal(): void {
    this.permits += 1;

    if (this.permits >= 1 && this.promiseResolvers.length > 0) {
      if (this.permits > 1) {
        throw new Error('this._permits should never be > 0 when there is someone waiting.');
      }

      this.permits -= 1;
      this.promiseResolvers.shift()(true);
    }
  }

  /**
   * Schedules func to be called once a permit becomes available.
   * @param {function} func - The function to be executed.
   */
  async execute(func: () => void) {
    await this.wait();
    try {
      await func();
    } finally {
      this.signal();
    }
  }
}
