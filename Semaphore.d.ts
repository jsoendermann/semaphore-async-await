declare module "semaphore-async-await" {
  /** Class representing a semaphore */
  class Semaphore {
    /**
     * Creates a semaphore.
     * @param {number} permits The number of permits, i.e. things being allowed to run in parallel.
     * To create a lock that only lets one thing run at a time, set this to 1. This number can also be negative.
     */
    constructor(permits: number);

    /**
     * Returns a promise used to wait for a permit to become available.
     * @return {Promise} A promise that gets resolved when execution is allowed to proceed.
     */
    wait(): Promise<boolean>;

    /**
     * Same as wait except the promise returned gets resolved with false if no permit becomes available in time.
     * @param {number} milliseconds The time spent waiting before the wait is aborted.
     * @return {Promise} A promise that gets resolved with true when execution is allowed to proceed or
     * false if the time given elapses before a permit becomes available.
     */
    waitFor(milliseconds: number): Promise<boolean>;

    /**
     * Synchronous function that tries to acquire a permit and returns true if successful, false otherwise.
     * @return {boolean} Whether a permit could be acquired.
     */
    tryAcquire(): boolean;

    /**
     * Increases the number of permits by one. If there are other functions waiting, one of them will
     * continue to execute in a future iteration of the event loop.
     */
    signal();

    /**
     * Schedules func to be called once a permit becomes available.
     * @param {function} func - The function to be executed.
     */
    execute(func: () => void): Promise<void>;
  }

  export default Semaphore;
}