/** Class representing a semaphore */
export default class Semaphore {
  /**
   * Creates a semaphore.
   * @param {number} permits The number of permits, i.e. things being allowed to run in parallel.
   * To create a lock that only lets one thing run at a time, set this to 1. This number can also be negative.
   */
  constructor(permits) {
    this._permits = permits;

    this._promiseResolvers = [];
  }

  /**
   * Returns a promise used to wait for a permit to become available.
   * @return {Promise} A promise that gets resolved when execution is allowed to proceed.
   */
  async wait() {
    if (this._permits > 0) {
      this._permits -= 1;
      return Promise.resolve(true);
    }
    return new Promise(resolver => this._promiseResolvers.push(resolver));
  }

  /**
   * Same as wait except the promise returned gets resolved with false if no permit becomes available in time.
   * @param {number} milliseconds The time spent waiting before the wait is aborted.
   * @return {Promise} A promise that gets resolved with true when execution is allowed to proceed or
   * false if the time given elapses before a permit becomes available.
   */
  async waitFor(milliseconds) {
    if (this._permits > 0) {
      this._permits -= 1;
      return Promise.resolve(true);
    }

    let resolver;
    const promise = new Promise(r => {
      resolver = r;
    });

    this._promiseResolvers.push(resolver);

    setTimeout(() => {
      const index = this._promiseResolvers.indexOf(resolver);
      if (index !== -1) {
        this._promiseResolvers.splice(index, 1);
      }
      resolver(false);
    }, milliseconds);

    return promise;
  }

  /**
   * Synchronous function that tries to acquire a permit and returns true if successful, false otherwise.
   * @return {boolean} Whether a permit could be acquired.
   */
  tryAcquire() {
    if (this._permits > 0) {
      this._permits -= 1;
      return true;
    }
    return false;
  }

  /**
   * Increases the number of permits by one. If there are other functions waiting, one of them will
   * continue to execute in a future iteration of the event loop.
   */
  signal() {
    this._permits += 1;

    if (this._permits >= 1 && this._promiseResolvers.length > 0) {
      if (this._permits > 1) {
        throw new Error('this._permits should never be > 0 when there is someone waiting.');
      }

      this._permits -= 1;
      this._promiseResolvers.shift()(true);
    }
  }

  /**
   * Schedules func to be called once a permit becomes available.
   * @param {function} func - The function to be executed.
   */
  async execute(func) {
    await this.wait();
    try {
      await func();
    } finally {
      this.signal();
    }
  }
}
