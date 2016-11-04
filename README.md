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

const f = () => {
  await lock.wait();

}

```

## Methods


## License
MIT