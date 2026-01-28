/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIntl } from 'ember-intl/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Unit | Controller | scopes/scope/workers/index', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en-us');

  let intl;
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

  const model = {
    tags: [{ key: 'env', value: 'os', type: 'config' }],
  };

  hooks.beforeEach(async function () {
    intl = this.owner.lookup('service:intl');
    store = this.owner.lookup('service:store');
    controller = this.owner.lookup('controller:scopes/scope/workers/index');

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
      config_tags: { type: ['dev'] },
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

  test('applyFilter action sets expected values correctly', async function (assert) {
    controller.set('model', model);
    const tag = { key: 'type', value: 'dev', type: 'config' };
    // Encode the tag to base64
    const encodedTag = window.btoa(JSON.stringify(tag));
    controller.applyFilter('tags', [encodedTag]);

    assert.deepEqual(controller.tags, [encodedTag]);
  });

  test('filters returns expected entries', function (assert) {
    controller.set('model', model.tags);
    assert.ok(controller.filters.allFilters);
    assert.ok(controller.filters.selectedFilters);
  });

  test('messageDescription returns correct translation with list authorization', async function (assert) {
    await visit(urls.workers);

    assert.strictEqual(
      controller.messageDescription,
      intl.t('resources.worker.description'),
    );
  });

  test('messageDescription returns correct translation with create authorization', async function (assert) {
    instances.scopes.global.authorized_collection_actions.workers = [
      'create:worker-led',
    ];
    await visit(urls.workers);

    assert.strictEqual(
      controller.messageDescription,
      intl.t('descriptions.create-but-not-list', {
        resource: intl.t('titles.workers'),
      }),
    );
  });

  test('messageDescription returns correct translation with no authorization', async function (assert) {
    instances.scopes.global.authorized_collection_actions.workers = [];
    await visit(urls.workers);

    assert.strictEqual(
      controller.messageDescription,
      intl.t('descriptions.neither-list-nor-create', {
        resource: intl.t('titles.workers'),
      }),
    );
  });
});
