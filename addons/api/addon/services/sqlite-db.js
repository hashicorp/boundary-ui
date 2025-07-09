/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Service from '@ember/service';
import { PWBHost } from 'promise-worker-bi';

export default class SqliteDbService extends Service {
  // =attributes
  webWorker;
  worker;
  webWorkerPath = '/workers/web-worker.js';

  // TODO: Actually use the name that gets passed into setup later
  async setup() {
    if (this.worker) {
      // If the worker already exists, we don't need to do anything.
      return;
    }

    // In production, our JS files will be fingerprinted with am MD5 hash
    // so we need a way to map the worker file name to be able to find it.
    //
    // Ember is automagically replacing any URL path with the fingerprinted
    // asset, and this is done by broccoli-asset-rev.
    //
    // The problem is it's a bit finicky as seen in this issue
    // https://github.com/ember-cli/broccoli-asset-rewrite/issues/66
    // and will not work properly if it's part of a template string or interpolated.
    // Therefore, we need the URL path in a string somewhere to be replaced properly.
    this.webWorker = new Worker(this.webWorkerPath, {
      type: 'module',
    });
    this.worker = new PWBHost(this.webWorker);
  }

  willDestroy() {
    this.webWorker?.terminate();
  }
}
