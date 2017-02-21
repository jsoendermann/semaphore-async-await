import Semaphore from './Semaphore'


export default class SemaphoreShepherd {
  private initialPermits: number;
  private semaphores: { [id: string]: Semaphore };

  constructor(initialPermits: number) {
    this.initialPermits = initialPermits;
    this.semaphores = {};
  }

  getSemaphoreById(id: string) {
    if (!semaphores[id]) {
      semaphores[id] = new Semaphore(this.initialPermits);
    }

    const semaphore = semaphores[id];

    return new Proxy(
      semaphore,
      {
        get (semaphore, attribute) {
          if (attribute === 'signal') {
            return () => {
              semaphore.signal();
              if (semaphore.permits === this.initialPermits) {
                delete this.semaphores[id];
              }
            }
          }
        }
      }
    );
  }

  get semaphoreCount {
    return this.semaphores.length;
  }
}
