/**
 * Copyright IBM Corp. 2021, 2026
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
    workers: null,
  };

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
    controller = this.owner.lookup('controller:scopes/scope/workers/new');

    instances.scopes.global = this.server.create(
      'scope',
      { id: 'global' },
      'withGlobalAuth',
    );
    await authenticateSession({
      isGlobal: true,
      account_id: this.server.schema.accounts.first().id,
    });
    instances.worker = this.server.create('worker', {
      scope: instances.scopes.global,
    });

    urls.workers = '/scopes/global/workers';
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
});
