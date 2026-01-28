/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Service from '@ember/service';
import { PWBHost } from 'promise-worker-bi';

export const formatDbName = (userId, clusterUrl) =>
  `boundary-${userId}-${clusterUrl}`;

// A mapping of columns to their expected model attributes for supported models
// The JSON data column is not included here but is assumed to always be last.
export const modelMapping = {
  target: {
    id: 'id',
    type: 'type',
    name: 'name',
    description: 'description',
    address: 'address',
    scope_id: 'scope.scope_id',
    created_time: 'created_time',
  },
  alias: {
    id: 'id',
    type: 'type',
    name: 'name',
    description: 'description',
    destination_id: 'destination_id',
    value: 'value',
    scope_id: 'scope.scope_id',
    created_time: 'created_time',
  },
  group: {
    id: 'id',
    name: 'name',
    description: 'description',
    scope_id: 'scope.scope_id',
    created_time: 'created_time',
  },
  role: {
    id: 'id',
    name: 'name',
    description: 'description',
    scope_id: 'scope.scope_id',
    created_time: 'created_time',
  },
  user: {
    id: 'id',
    name: 'name',
    description: 'description',
    scope_id: 'scope.scope_id',
    created_time: 'created_time',
  },
  'credential-store': {
    id: 'id',
    type: 'type',
    name: 'name',
    description: 'description',
    scope_id: 'scope.scope_id',
    created_time: 'created_time',
  },
  scope: {
    id: 'id',
    type: 'type',
    name: 'name',
    description: 'description',
    scope_id: 'scope.scope_id',
    created_time: 'created_time',
  },
  'auth-method': {
    id: 'id',
    type: 'type',
    name: 'name',
    description: 'description',
    is_primary: 'is_primary',
    scope_id: 'scope.scope_id',
    created_time: 'created_time',
  },
  'host-catalog': {
    id: 'id',
    type: 'type',
    name: 'name',
    description: 'description',
    plugin_name: 'plugin.name',
    scope_id: 'scope.scope_id',
    created_time: 'created_time',
  },
  'session-recording': {
    id: 'id',
    type: 'type',
    state: 'state',
    start_time: 'start_time',
    end_time: 'end_time',
    duration: 'duration',
    scope_id: 'scope.scope_id',
    user_id: 'create_time_values.user.id',
    user_name: 'create_time_values.user.name',
    target_id: 'create_time_values.target.id',
    target_name: 'create_time_values.target.name',
    target_scope_id: 'create_time_values.target.scope.id',
    target_scope_name: 'create_time_values.target.scope.name',
    target_scope_parent_scope_id:
      'create_time_values.target.scope.parent_scope_id',
    created_time: 'created_time',
  },
  session: {
    id: 'id',
    type: 'type',
    status: 'status',
    endpoint: 'endpoint',
    target_id: 'target_id',
    user_id: 'user_id',
    scope_id: 'scope.scope_id',
    created_time: 'created_time',
  },
};

export default class SqliteDbService extends Service {
  // =attributes

  // We need a handle on the original web worker to properly clean it up.
  webWorker;
  // This will be the worker we interact with that is wrapped by PWBHost.
  worker;

  setup(dbName) {
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
    this.webWorker = new Worker('/workers/sqlite-worker.js', {
      type: 'module',
    });

    // We use PWBHost to simplify communication so we can just send and receive
    // messages with promises rather than having to manually set up event listeners
    this.worker = new PWBHost(this.webWorker);
    this.worker.register(async ({ method }) => {
      if (method === 'getDatabaseName') {
        return dbName;
      }
    });
  }

  fetchResource({ sql, parameters }) {
    return this.worker.postMessage({
      method: 'fetchResource',
      payload: { sql, parameters },
    });
  }

  insertResource(resource, items) {
    return this.worker.postMessage({
      method: 'insertResource',
      payload: { resource, items, modelMapping },
    });
  }

  deleteResource(resource, ids) {
    return this.worker.postMessage({
      method: 'deleteResource',
      payload: { resource, ids },
    });
  }

  analyzeDatabase() {
    return this.worker.postMessage({ method: 'analyzeDatabase' });
  }

  async downloadDatabase() {
    const byteArray = await this.worker.postMessage({
      method: 'downloadDatabase',
    });

    const blob = new Blob([byteArray.buffer], {
      type: 'application/x-sqlite3',
    });

    // Create temporary elements to initialize the download
    const a = window.document.createElement('a');
    window.document.body.appendChild(a);
    a.href = window.URL.createObjectURL(blob);
    a.download = 'boundary.db';
    a.addEventListener('click', function () {
      setTimeout(function () {
        window.URL.revokeObjectURL(a.href);
        a.remove();
      }, 500);
    });
    a.click();
  }

  async clearDatabase() {
    await this.worker.postMessage({ method: 'clearDatabase' });
  }

  async deleteDatabase() {
    await this.worker.postMessage({ method: 'deleteDatabase' });
  }

  willDestroy() {
    this.webWorker?.terminate();
  }
}
