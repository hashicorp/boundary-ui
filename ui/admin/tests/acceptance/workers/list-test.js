/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { authenticateSession } from 'ember-simple-auth/test-support';

const WORKERS_FLYOUT = '[data-test-worker-tags-flyout]';
const WORKERS_FLYOUT_DISMISS = '[data-test-worker-tags-flyout] div button';
const WORKERS_FLYOUT_TABLE_BODY = '[data-test-worker-tags-flyout] tbody';
const WORKERS_FLYOUT_TABLE_ROWS = '[data-test-worker-tags-flyout] tbody tr';
const WORKERS_FLYOUT_VIEW_MORE_TAGS =
  '[data-test-worker-tags-flyout] .view-more-tags a';
const WORKER_TAGS_BUTTON = (workerId) =>
  `[data-test-worker-tags-flyout-button="${workerId}"]`;
const TAGS_FILTER_TOGGLE = '.workers details summary';
const TAGS_FILTER_FIRST_ITEM_SELECTOR =
  '.workers details div input:first-child';

module('Acceptance | workers | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  let featuresService;

  const instances = {
    scopes: {
      global: null,
    },
    worker: null,
    worker2: null,
  };

  const urls = {
    globalScope: null,
    workers: null,
    worker: null,
    workerTags: null,
  };

  hooks.beforeEach(async function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.worker = this.server.create('worker', {
      scope: instances.scopes.global,
    });
    instances.worker2 = this.server.create('worker', {
      scope: instances.scopes.global,
    });
    urls.globalScope = `/scopes/global/scopes`;
    urls.workers = `/scopes/global/workers`;
    urls.worker = `${urls.workers}/${instances.worker.id}`;
    urls.workerTags = `${urls.worker}/tags`;
    await authenticateSession({});
    featuresService = this.owner.lookup('service:features');
  });

  test('Users can navigate to workers with proper authorization', async function (assert) {
    featuresService.enable('byow');
    await visit(urls.globalScope);
    assert.ok(
      instances.scopes.global.authorized_collection_actions.workers.includes(
        'list',
      ),
    );
    assert.dom(`[href="${urls.workers}"]`).isVisible();
  });

  test('Users cannot navigate to workers without list or create permissions', async function (assert) {
    featuresService.enable('byow');
    instances.scopes.global.authorized_collection_actions.workers = [];

    await visit(urls.globalScope);
    assert.dom(`[href="${urls.workers}"]`).isNotVisible();
  });

  test('Users can navigate to workers with only create permission', async function (assert) {
    featuresService.enable('byow');
    instances.scopes.global.authorized_collection_actions.workers = [
      'create:worker-led',
    ];

    await visit(urls.globalScope);
    assert.dom(`[href="${urls.workers}"]`).isVisible();
  });

  test('Users can navigate to workers with only list permission', async function (assert) {
    featuresService.enable('byow');
    instances.scopes.global.authorized_collection_actions.workers = ['list'];

    await visit(urls.globalScope);
    assert.dom(`[href="${urls.workers}"]`).isVisible();
  });

  test('Users can filter by tags', async function (assert) {
    featuresService.enable('byow');
    await visit(urls.workers);

    assert.dom('tbody tr').exists({ count: 2 });

    await click(TAGS_FILTER_TOGGLE);
    await click(TAGS_FILTER_FIRST_ITEM_SELECTOR);

    assert.dom('tbody tr').exists({ count: 1 });
  });

  test('Users can open and close tags flyout for a specific worker', async function (assert) {
    featuresService.enable('byow');
    await visit(urls.workers);
    assert.dom(WORKERS_FLYOUT).isNotVisible();

    await click(WORKER_TAGS_BUTTON(instances.worker.id));
    assert.dom(WORKERS_FLYOUT).isVisible();

    await click(WORKERS_FLYOUT_DISMISS);
    assert.dom(WORKERS_FLYOUT).isNotVisible();
  });

  test('Users can see worker tags in the tags flyout', async function (assert) {
    featuresService.enable('byow');
    await visit(urls.workers);
    await click(WORKER_TAGS_BUTTON(instances.worker.id));

    assert.dom(WORKERS_FLYOUT_TABLE_BODY).includesText('os = z-os');
  });

  test('Users can only see first 10 tags in the tags flyout', async function (assert) {
    featuresService.enable('byow');
    instances.worker.update({
      configTags: {
        tag1: ['value1', 'value2'],
        tag2: ['value3'],
        tag3: ['value4'],
        tag4: ['value5'],
        tag5: ['value6'],
        tag6: ['value7'],
        tag7: ['value8'],
        tag8: ['value9'],
        tag9: ['value10'],
        tag10: ['value11'],
        tag11: ['value12'],
      },
    });

    await visit(urls.workers);
    await click(WORKER_TAGS_BUTTON(instances.worker.id));

    assert.dom(WORKERS_FLYOUT_TABLE_ROWS).exists({ count: 10 });
  });

  test('Users can click on "view more tags" if there are more than 10 tags', async function (assert) {
    featuresService.enable('byow');
    instances.worker.update({
      configTags: {
        tag1: ['value1', 'value2'],
        tag2: ['value3'],
        tag3: ['value4'],
        tag4: ['value5'],
        tag5: ['value6'],
        tag6: ['value7'],
        tag7: ['value8'],
        tag8: ['value9'],
        tag9: ['value10'],
        tag10: ['value11'],
        tag11: ['value12'],
      },
    });

    await visit(urls.workers);
    await click(WORKER_TAGS_BUTTON(instances.worker.id));

    assert.dom(WORKERS_FLYOUT_TABLE_ROWS).exists({ count: 10 });
    assert.dom(WORKERS_FLYOUT_VIEW_MORE_TAGS).isVisible();
  });

  test('Users do not see "view more tags" if there are 10 or less tags', async function (assert) {
    featuresService.enable('byow');
    instances.worker.update({
      configTags: {
        tag1: ['value1', 'value2'],
        tag2: ['value3'],
        tag3: ['value4'],
        tag4: ['value5'],
      },
      apiTags: null,
    });

    await visit(urls.workers);
    await click(WORKER_TAGS_BUTTON(instances.worker.id));

    assert.dom(WORKERS_FLYOUT_TABLE_ROWS).exists({ count: 5 });
    assert.dom(WORKERS_FLYOUT_VIEW_MORE_TAGS).isNotVisible();
  });

  test('Users do not see worker tags flyout when returning to workers list', async function (assert) {
    featuresService.enable('byow');
    await visit(urls.workers);
    await click(WORKER_TAGS_BUTTON(instances.worker.id));

    assert.dom(WORKERS_FLYOUT).isVisible();

    await click(WORKERS_FLYOUT_VIEW_MORE_TAGS);

    assert.strictEqual(currentURL(), urls.workerTags);

    await click(`[href="${urls.workers}"]`);

    assert.strictEqual(currentURL(), urls.workers);
    assert.dom(WORKERS_FLYOUT).isNotVisible();
  });
});
