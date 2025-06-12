import Service from '@ember/service';
import { PWBHost } from 'promise-worker-bi';

// A mapping of columns to their expected model attributes for supported models
// The order matters, it _must_ be the same as the order of the columns in the database.
// ID is assumed to be always present and is the first column in the database.
// The JSON data is assumed to always be last.
export const modelMapping = {
  target: {
    type: 'type',
    name: 'name',
    description: 'description',
    address: 'address',
    scope_id: 'scope.scope_id',
    created_time: 'created_time',
  },
};

export default class WebWorkerService extends Service {
  // =attributes
  worker;
  webWorkerPath = '/workers/web-worker.js';

  async setup() {
    if (this.worker) {
      // If the worker already exists, we don't need to do anything.
      return;
    }

    // In production, our JS files will be fingerprinted with am MD5 hash
    // so we need a way to map the worker file name to be able to find it.

    // Ember is automagically replacing any URL path with the fingerprinted
    // asset, and this is done by broccoli-asset-rev.

    // The problem is it's a bit finicky as seen in this issue
    // https://github.com/ember-cli/broccoli-asset-rewrite/issues/66
    // and will not work properly if it's part of a template string or interpolated.
    // Therefore, we need the URL path in a string somewhere to be replaced properly.
    const webWorker = new Worker(this.webWorkerPath, {
      type: 'module',
    });
    this.worker = new PWBHost(webWorker);
  }

  async fetchResource({ sql, parameters }) {
    return this.worker.postMessage({
      method: 'fetchResource',
      payload: { sql, parameters },
    });
  }

  async insertResource(resource, items) {
    return this.worker.postMessage({
      method: 'insertResource',
      payload: { resource, items },
    });
  }

  async deleteResource(resource, ids) {
    return this.worker.postMessage({
      method: 'deleteResource',
      payload: { resource, ids },
    });
  }

  willDestroy() {
    this.worker?.terminate();
  }
}
