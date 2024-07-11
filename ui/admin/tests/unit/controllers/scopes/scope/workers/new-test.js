/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Unit | Controller | scopes/scope/workers/new', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  let store;
  let controller;

  const instances = {
    scopes: {
      global: null,
    },
    worker: null,
  };

  const urls = {
    globalScope: null,
    workers: null,
  };

  hooks.beforeEach(function () {
    authenticateSession({});
    store = this.owner.lookup('service:store');
    controller = this.owner.lookup('controller:scopes/scope/workers/new');

    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.worker = this.server.create('worker', {
      scope: instances.scopes.global,
    });

    urls.globalScope = `/scopes/global`;
    urls.workers = `${urls.globalScope}/workers`;
  });

  test('it exists', function (assert) {
    assert.ok(controller);
  });

  test('cancel action rolls-back changes on a new model', async function (assert) {
    await visit(urls.workers);
    const worker = store.createRecord('worker', instances.worker.id);
    worker.name = 'test';

    assert.strictEqual(worker.name, 'test');

    await controller.cancel(worker);

    assert.notEqual(worker.name, 'test');
  });

  test('createWorkerLed action saves changes on the specified model', async function (assert) {
    await visit(urls.workers);
    const worker = await store.findRecord('worker', instances.worker.id);
    worker.name = 'test';

    await controller.createWorkerLed(worker);

    assert.strictEqual(worker.name, 'test');
  });
});
