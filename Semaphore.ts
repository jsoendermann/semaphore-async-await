/** Class representing a semaphore
 * Semaphores are initialized with a number of permits that get aquired and released
 * over the lifecycle of the Semaphore. Functions can wait and stop executing until
 * a permit gets released (the method for which is called signal for historical reasons.)
 * 
 * Locks that only allow one execution of a critical section are a special case of
 * Semaphores. To construct a lock, initialize a Semaphore with a permit count of 1.
 * 
 * This Semaphore class is implemented with the help of promises that get returned
 * by functions that wait for permits to become available. This makes it possible
 * to use async/awaits to synchronize your code.
*/
export default class Semaphore {
  private promiseResolverQueue: Array<(v: boolean) => void> = [];

  /**
   * Creates a semaphore.
   * @param {number} permits The number of permits, i.e. things being allowed to run in parallel.
   * To create a lock that only lets one thing run at a time, set this to 1.
   * This number can also be negative.
   */
  constructor(private permits: number) {}

  /**
   * Returns a promise used to wait for a permit to become available. This method should be awaited on.
   * @return {Promise} A promise that gets resolved when execution is allowed to proceed.
   */
  async wait(): Promise<boolean> {
    if (this.permits > 0) {
      this.permits -= 1;
      return Promise.resolve(true);
    }

    // If there is no permit available, we return a promise that resolves once the semaphore gets
    // signaled enough times that permits is equal to one.
    return new Promise<boolean>(resolver => this.promiseResolverQueue.push(resolver));
  }

  /**
   * Alias for [wait]{@link Semaphore#wait}.
   * @return {Promise} A promise that gets resolved when execution is allowed to proceed.
   */
  async acquire(): Promise<boolean> {
    return this.wait();
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

    // We save the resolver function in the current scope so that we can resolve the promise
    // if the time expires.
    let resolver: (v: boolean) => void = b => void(0);
    const promise = new Promise<boolean>(r => {
      resolver = r;
    });

    // The saved resolver gets added to our list of promise resolvers so that it gets a chance
    // to be resolved as a result of a call to signal().
    this.promiseResolverQueue.push(resolver);

    setTimeout(() => {
      // We have to remove the promise resolver from our list. Resolving it twice would not be
      // an issue but signal() always takes the next resolver from the queue and resolves it which
      // would swallow a permit if we didn't remove it.
      const index = this.promiseResolverQueue.indexOf(resolver);
      if (index !== -1) {
        this.promiseResolverQueue.splice(index, 1);
      } else {
        // This is weird... TODO Think about what the best course of action would be at this point.
        // Probably do nothing.
      }
      
      // false because the wait was unsuccessful.
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
   * Acquires all permits that are currently available and returns the number of acquired permits.
   * @return {number} Acquired permits.
   */
  drainPermits(): number {
    if (this.permits > 0) {
      const permitCount = this.permits;
      this.permits = 0;
      return permitCount;
    }

    return 0;
  }

  /**
   * Increases the number of permits by one. If there are other functions waiting, one of them will
   * continue to execute in a future iteration of the event loop.
   */
  signal(): void {
    this.permits += 1;

    if (this.permits > 1 && this.promiseResolverQueue.length > 0) {
      throw new Error('this._permits should never be > 0 when there is someone waiting.');
    } else if (this.permits === 1 && this.promiseResolverQueue.length > 0) {
      // If there is someone else waiting, immediately consume the permit that was released
      // at the beginning of this function and let the waiting function resume.
      this.permits -= 1;

      const nextResolver = this.promiseResolverQueue.shift();
      if (nextResolver) {
        nextResolver(true);
      }
    }
  }

  /**
   * This is an alias for [signal]{@link Semaphore#signal}.
   */
  release(): void {
    this.signal();
  }

  /**
   * Schedules func to be called once a permit becomes available.
   * @param {function} func - The function to be executed.
   * @return {T} A promise that gets resolved with the return value of the function.
   */
  async execute<T>(func: () => T): Promise<T> {
    await this.wait();
    try {
      return await func();
    } finally {
      this.signal();
    }
  }
}
