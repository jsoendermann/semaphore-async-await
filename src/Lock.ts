import Semaphore from './Semaphore';


/**
 * A lock that can be used to synchronize critical sectionds in your code.
 * For more details on how to use this class, please view the documentation
 * of the Semaphore class from which Lock inherits.
 */
export class Lock extends Semaphore {
  /**
   * Creates a lock.
   */
  constructor() {
    super(1);
  }
}
