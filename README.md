# JavaScript Semaphore

A promise-based semaphore implementation suitable to be used with ES7 async/await.

## But JavaScript is single-threaded and doesn't need semaphores!
This package can be used to synchronize functions that span multiple iterations of the event loop and prevent other code from being executed while your function is waiting for some event.

## Install
```yarn add semaphore-async-await```

## Usage
```javascript
import Semaphore from 'semaphore-async-await';

(async () => {
  
  // A Semaphore with one permit is a lock
  const lock = new Semaphore(1);

  // Helper function used to wait for the given number of milliseconds
  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  let globalVar = 0;

  (async () => {
    // This waits (without blocking the event loop) until a permit becomes available
    await lock.wait();
    const localCopy = globalVar;
    await wait(500);
    globalVar = localCopy + 1;
    // Signal releases the lock and lets other things run
    lock.signal();
  })();

  // This returns false because the function above has acquired the lock
  // and is scheduled to continue executing once the main function yields or
  // returns
  console.log(lock.tryAcquire() === false);

  // Similar to the function above but using waitFor instead of wait. We
  // give it five seconds to wait which is enough time for it to acquire
  // the lock
  (async () => {
    // This waits for at least five seconds, trying to acquire a permit.
    const didAcquireLock = await lock.waitFor(5000);
    if (didAcquireLock) {
      const localCopy = globalVar;
      await wait(500);
      globalVar = localCopy + 1;
      // Signal releases the lock and lets other things run
      lock.signal();
    }
  })();

  // Alternative to using wait()/signal() directly
  lock.execute(async () => {
    const localCopy = globalVar;
    await wait(500);
    globalVar = localCopy + 1;
  });

  // Wait for everything to finish
  await wait(2000);

  console.log(globalVar === 3);
})();
```

## Methods

<dl>
<dt><a href="#wait">Semaphore(premits)</a> ⇒ <code>Semaphore</code></dt>
<dd><p>Creates a semaphore with the given number of permits, i.e. things being allowed to run in parallel. To create a lock that only lets one thing run at a time, give it one permit. This number can also be negative.</p>
</dd>
<dt><a href="#wait">wait()</a> ⇒ <code>Promise</code></dt>
<dd><p>Returns a promise used to wait for a permit to become available.</p>
</dd>
<dt><a href="#waitFor">waitFor(milliseconds)</a> ⇒ <code>Promise</code></dt>
<dd><p>Same as wait except the promise returned gets resolved with false if no permit becomes available in time.</p>
</dd>
<dt><a href="#tryAcquire">tryAcquire()</a> ⇒ <code>boolean</code></dt>
<dd><p>Synchronous function that tries to acquire a permit and returns true if successful, false otherwise.</p>
</dd>
<dt><a href="#signal">signal()</a></dt>
<dd><p>Increases the number of permits by one. If there are other functions waiting, one of them will
continue to execute in a future iteration of the event loop.</p>
</dd>
<dt><a href="#execute">execute(func)</a></dt>
<dd><p>Schedules func to be called once a permit becomes available.</p>
</dd>
</dl>



## License
MIT