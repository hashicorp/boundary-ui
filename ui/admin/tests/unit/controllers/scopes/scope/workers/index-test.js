/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Unit | Controller | scopes/scope/workers/index', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  let store;
  let controller;
  let getWorkerCount;

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
    controller = this.owner.lookup('controller:scopes/scope/workers/index');

    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.worker = this.server.create('worker', {
      scope: instances.scopes.global,
    });

    urls.globalScope = `/scopes/global`;
    urls.workers = `${urls.globalScope}/workers`;

    getWorkerCount = () => this.server.schema.workers.all().models.length;
  });

  test('it exists', function (assert) {
    assert.ok(controller);
  });

  test('cancel action rolls-back changes on the specified model', async function (assert) {
    await visit(urls.workers);
    const worker = await store.findRecord('worker', instances.worker.id);
    worker.name = 'test';

    assert.strictEqual(worker.name, 'test');

    await controller.cancel(worker);

    assert.notEqual(worker.name, 'test');
  });

  test('save action saves changes on the specified model', async function (assert) {
    await visit(urls.workers);
    const worker = await store.findRecord('worker', instances.worker.id);
    worker.name = 'test';

    await controller.save(worker);

    assert.strictEqual(worker.name, 'test');
  });

  test('delete action destroys specified model', async function (assert) {
    const worker = await store.findRecord('worker', instances.worker.id);
    const workerCount = getWorkerCount();

    await controller.delete(worker);

    assert.strictEqual(getWorkerCount(), workerCount - 1);
  });
});
