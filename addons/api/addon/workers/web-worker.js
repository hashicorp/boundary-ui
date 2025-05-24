console.log('Im in the worker');

import { PWBWorker } from 'promise-worker-bi';

const promiseWorker = new PWBWorker();

promiseWorker.register((message) => {
  console.log(`Received from main: ${message}`);
  return 'New data';
});
