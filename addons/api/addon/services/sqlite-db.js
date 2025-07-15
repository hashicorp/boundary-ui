/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Service from '@ember/service';
import { PWBHost } from 'promise-worker-bi';

export default class SqliteDbService extends Service {
  // =attributes

  // We need a handle on the original web worker to properly clean it up.
  webWorker;
  // This will be the worker we interact with that is wrapped by PWBHost.
  worker;

  // TODO: Actually use the name that gets passed into setup later
  setup() {
    if (this.worker) {
      // If the worker already exists, we don't need to do anything.
      return;
    }

    // In production, our JS files will be fingerprinted with an MD5 hash
    // so we need a way to map the worker file name to be able to find it.
    //
    // Ember is automagically replacing any URL path with the fingerprinted
    // asset, and this is done by broccoli-asset-rev.
    //
    // The problem is it's a bit finicky as seen in this issue
    // https://github.com/ember-cli/broccoli-asset-rewrite/issues/66
    // and will not work properly if it's part of a template string or interpolated.
    // Therefore, we need the URL path in a string somewhere to be replaced properly.
    this.webWorker = new Worker('/workers/web-worker.js', {
      type: 'module',
    });

    // We use PWBHost to simplify communication so we can just send and receive
    // messages with promises rather than having to manually set up event listeners
    this.worker = new PWBHost(this.webWorker);
  }

  willDestroy() {
    this.webWorker?.terminate();
  }
}
