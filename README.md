# JavaScript Semaphore

A promise-based semaphore implementation suitable to be used with ES7 async/await.

## But JavaScript is single-threaded and doesn't need semaphores!
This package can be used to synchronize functions that span multiple iterations of the event loop and prevent other code from being executed while your function is waiting for some event.

## Install
```yarn add semaphore-async-await```

## Usage
```javascript
import Semaphore from 'semaphore-async-await';
const lock = new Semaphore(1);

const wait = (ms) => new Promise(r => setTimeout(r, ms));

let globalVar = 0

const critical = () => {
  await lock.wait();
  const localCopy = globalVar;
  await wait(500);
  globalVar = localCopy + 1;
  lock.signal();
}

critical();
critical();

await wait(1200);

console.log(globalVar === 2);
```

## Methods

<dl>
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

<a name="wait"></a>

## wait() ⇒ <code>Promise</code>
Returns a promise used to wait for a permit to become available.

**Kind**: global function  
**Returns**: <code>Promise</code> - A promise that gets resolved when execution is allowed to proceed.  
<a name="waitFor"></a>

## waitFor(milliseconds) ⇒ <code>Promise</code>
Same as wait except the promise returned gets resolved with false if no permit becomes available in time.

**Kind**: global function  
**Returns**: <code>Promise</code> - A promise that gets resolved with true when execution is allowed to proceed or
false if the time given elapses before a permit becomes available.  

| Param | Type | Description |
| --- | --- | --- |
| milliseconds | <code>number</code> | The time spent waiting before the wait is aborted. |

<a name="tryAcquire"></a>

## tryAcquire() ⇒ <code>boolean</code>
Synchronous function that tries to acquire a permit and returns true if successful, false otherwise.

**Kind**: global function  
**Returns**: <code>boolean</code> - Whether a permit could be acquired.  
<a name="signal"></a>

## signal()
Increases the number of permits by one. If there are other functions waiting, one of them will
continue to execute in a future iteration of the event loop.

**Kind**: global function  
<a name="execute"></a>

## execute(func)
Schedules func to be called once a permit becomes available.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| func | <code>function</code> | The function to be executed. |



## License
MIT