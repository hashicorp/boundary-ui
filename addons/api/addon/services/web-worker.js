import Service, { service } from '@ember/service';

export default class WebWorkerService extends Service {
  // =services
  @service assetMap;

  // =attributes
  registry = {};

  setup(workerName) {
    // In production, our JS files will be fingerprinted with am MD5 hash
    // so we need a way to map the worker file name to be able to find it
    const webWorkerUrl = this.assetMap.resolve(`workers/${workerName}.js`);
    const worker = new Worker(webWorkerUrl);
    worker.onmessage = (e) => {
      console.log(`Received from worker: ${e.data}`);
    };
    worker.postMessage('Test');

    this.registry[workerName] = worker;
  }

  willDestroy() {
    Object.values(this.registry).forEach((worker) => {
      worker?.terminate();
    });
  }
}
