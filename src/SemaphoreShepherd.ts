import { Semaphore } from './Semaphore'


/** 
 * SemaphoreShepherd manages a set of Semaphores, destroying and recreating
 * them as appropriate to save memory.
 * This class is useful in a situation where you might want to use an object
 * that maps from ids to semaphore. The use case that motivated this class was
 * a server that needs to keep a lock for each user. This was initially implemented
 * with an object that mapped from userIds to semaphores. Whenever a new user
 * first used the system, a new lock was created.
 * The reason this implementation is problematic is that semaphores are never
 * removed from the object, even though they don't have to be kept around after
 * they return to their initial state as they can be recreated on demand.
 * This is what SemaphoreShepherd does in a way that is transparent to the
 * user of this class.
 */
export class SemaphoreShepherd {
  private initialSemaphorePermits: number;
  private semaphores: Map<string, Semaphore>;

  /**
   * Creates a semaphore shepherd.
   * @param initialSemaphorePermits  The number of permits that each newly
   * created Semaphore gets initialized with. For more information, see
   * {@linkcode Semaphore.constructor}
   */
  constructor(initialSemaphorePermits: number) {
    this.initialSemaphorePermits = initialSemaphorePermits;
    this.semaphores = new Map<string, Semaphore>();
  }

  /**
   * Returns a semaphore for the given id. WARNING: Never store the object returned
   * by this method.
   * @example
   * await shepherd.getSemaphoreById(userId).wait()
   * // ...
   * shepherd.getSemaphoreById(userId).signal()
   * @param id  A string that uniquely identifies the resource you want to synchronize.
   * @returns  A semaphore for that id.
   */
  getSemaphoreById(id: string) {
    // Create a new semaphore if necessary
    if (!this.semaphores.get(id)) {
      this.semaphores.set(id, new Semaphore(this.initialSemaphorePermits));
    }
    // We force cast because we know for certain that the result of this
    // method call will never be undefined.
    const semaphore = this.semaphores.get(id) as Semaphore;

    const that = this

    // We return a proxy object that intercepts calls to Semaphore.signal
    // and and wraps it in a function that, after signalling the semaphore,
    // checks if the number of permits is equal to the initial number of permits.
    // If this is the case, the semaphore gets removed from this.semaphores.
    return new Proxy<Semaphore>(
      semaphore,
      {
        get(semaphore: Semaphore, attribute: string): any {
          if (attribute === 'signal') {
            return () => {
              semaphore.signal();
              if (semaphore.permits === that.initialSemaphorePermits) {
                that.semaphores.delete(id);
              }
            }
          }
          // Necessary to make typescript accept us passing on the attribute
          // access
          return (semaphore as any)[attribute];
        }
      }
    );
  }

  /**
   * Returns the number of semaphores currently being managed by the shepherd.
   * Used in testing this class.
   * @returns  The number of semaphores currently being managed.
   */
  get semaphoreCount(): number {
    return this.semaphores.size;
  }
}
