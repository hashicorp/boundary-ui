import Service from '@ember/service';
import { PWBHost } from 'promise-worker-bi';

export default class WebWorkerService extends Service {
  // =attributes
  registry = {};
  webWorkerPath = {
    'web-worker': '/workers/web-worker.js',
  };

  // TODO: Setup in shared worker instead
  async setup(workerName) {
    if (this.registry[workerName]) {
      // If the worker is already registered, we don't need to do anything.
      return;
    }
    // In production, our JS files will be fingerprinted with am MD5 hash
    // so we need a way to map the worker file name to be able to find it.

    // You might also be wondering why there's an unnecessary mapping to grab
    // the web worker path rather than just interpolating the path with the name,
    // and this is *very important*. Ember once again is automagically replacing
    // any URL path with the fingerprinted asset, and this is done by broccoli-asset-rev.

    // The problem is it's a bit finicky as seen in this issue
    // https://github.com/ember-cli/broccoli-asset-rewrite/issues/66
    // and will not work properly if it's part of a template string or interpolated.
    // Therefore, we need the URL path in a string somewhere to be replaced properly.
    const worker = new Worker(this.webWorkerPath[workerName], {
      type: 'module',
    });
    this.registry[workerName] = new PWBHost(worker);
  }

  willDestroy() {
    Object.values(this.registry).forEach((worker) => {
      worker?.terminate();
    });
  }
}
