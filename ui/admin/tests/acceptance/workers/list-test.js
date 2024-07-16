/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, currentURL, fillIn, waitFor } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | workers | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  const WORKERS_FLYOUT = '[data-test-worker-tags-flyout]';
  const WORKERS_FLYOUT_DISMISS = '[data-test-worker-tags-flyout] div button';
  const WORKERS_FLYOUT_TABLE_BODY = '[data-test-worker-tags-flyout] tbody';
  const WORKERS_FLYOUT_TABLE_ROWS = '[data-test-worker-tags-flyout] tbody tr';
  const WORKERS_FLYOUT_VIEW_MORE_TAGS =
    '[data-test-worker-tags-flyout] .view-more-tags a';
  const SEARCH_INPUT_SELECTOR = '.search-filtering [type="search"]';
  const NO_RESULTS_MSG_SELECTOR = '[data-test-no-worker-results]';
  const FILTER_APPLY_BUTTON_SELECTOR =
    '.search-filtering [data-test-dropdown-apply-button]';
  const WORKER_TAGS_BUTTON = (workerId) =>
    `[data-test-worker-tags-flyout-button="${workerId}"]`;
  const FILTER_DROPDOWN_SELECTOR = (name) =>
    `.search-filtering [name="${name}"] button`;

  let featuresService;

  const instances = {
    scopes: {
      global: null,
    },
    worker1: null,
    worker2: null,
  };

  const urls = {
    globalScope: null,
    workers: null,
    worker1: null,
    worker2: null,
    workerTags: null,
  };

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    const scope = instances.scopes.global;
    instances.worker1 = this.server.create('worker', { scopeId: scope.id });
    instances.worker2 = this.server.create('worker', { scopeId: scope.id });
    urls.globalScope = `/scopes/global/scopes`;
    urls.workers = `/scopes/global/workers`;
    urls.worker1 = `${urls.workers}/${instances.worker1.id}`;
    urls.worker2 = `${urls.workers}/${instances.worker2.id}`;
    urls.workerTags = `${urls.worker1}/tags`;
    authenticateSession({});
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

  test('Users can open and close tags flyout for a specific worker', async function (assert) {
    featuresService.enable('byow');
    await visit(urls.workers);
    assert.dom(WORKERS_FLYOUT).isNotVisible();

    await click(WORKER_TAGS_BUTTON(instances.worker1.id));
    assert.dom(WORKERS_FLYOUT).isVisible();

    await click(WORKERS_FLYOUT_DISMISS);
    assert.dom(WORKERS_FLYOUT).isNotVisible();
  });

  test('Users can see worker tags in the tags flyout', async function (assert) {
    featuresService.enable('byow');
    await visit(urls.workers);
    await click(WORKER_TAGS_BUTTON(instances.worker1.id));

    assert.dom(WORKERS_FLYOUT_TABLE_BODY).includesText('os = z-os');
  });

  test('Users can only see first 10 tags in the tags flyout', async function (assert) {
    featuresService.enable('byow');
    instances.worker1.update({
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
    await click(WORKER_TAGS_BUTTON(instances.worker1.id));

    assert.dom(WORKERS_FLYOUT_TABLE_ROWS).exists({ count: 10 });
  });

  test('Users can click on "view more tags" if there are more than 10 tags', async function (assert) {
    featuresService.enable('byow');
    instances.worker1.update({
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
    await click(WORKER_TAGS_BUTTON(instances.worker1.id));

    assert.dom(WORKERS_FLYOUT_TABLE_ROWS).exists({ count: 10 });
    assert.dom(WORKERS_FLYOUT_VIEW_MORE_TAGS).isVisible();
  });

  test('Users do not see "view more tags" if there are 10 or less tags', async function (assert) {
    featuresService.enable('byow');
    instances.worker1.update({
      configTags: {
        tag1: ['value1', 'value2'],
        tag2: ['value3'],
        tag3: ['value4'],
        tag4: ['value5'],
      },
      apiTags: null,
    });

    await visit(urls.workers);
    await click(WORKER_TAGS_BUTTON(instances.worker1.id));

    assert.dom(WORKERS_FLYOUT_TABLE_ROWS).exists({ count: 5 });
    assert.dom(WORKERS_FLYOUT_VIEW_MORE_TAGS).isNotVisible();
  });

  test('Users do not see worker tags flyout when returning to workers list', async function (assert) {
    featuresService.enable('byow');
    await visit(urls.workers);
    await click(WORKER_TAGS_BUTTON(instances.worker1.id));

    assert.dom(WORKERS_FLYOUT).isVisible();

    await click(WORKERS_FLYOUT_VIEW_MORE_TAGS);

    assert.strictEqual(currentURL(), urls.workerTags);

    await click(`[href="${urls.workers}"]`);

    assert.strictEqual(currentURL(), urls.workers);
    assert.dom(WORKERS_FLYOUT).isNotVisible();
  });

  test('user can search for a specifc worker by id', async function (assert) {
    featuresService.enable('byow');
    await visit(urls.globalScope);

    await click(`[href="${urls.workers}"]`);

    assert.dom(`[href="${urls.worker1}"]`).exists();
    assert.dom(`[href="${urls.worker2}"]`).exists();

    await fillIn(SEARCH_INPUT_SELECTOR, instances.worker1.id);
    await waitFor(`[href="${urls.worker2}"]`, { count: 0 });

    assert.dom(`[href="${urls.worker1}"]`).exists();
    assert.dom(`[href="${urls.worker2}"]`).doesNotExist();
  });

  test('user can search for workers and get no results', async function (assert) {
    featuresService.enable('byow');
    await visit(urls.globalScope);

    await click(`[href="${urls.workers}"]`);

    assert.dom(`[href="${urls.worker1}"]`).exists();
    assert.dom(`[href="${urls.worker2}"]`).exists();

    await fillIn(SEARCH_INPUT_SELECTOR, 'fake target that does not exist');
    await waitFor(NO_RESULTS_MSG_SELECTOR, { count: 1 });

    assert.dom(`[href="${urls.worker1}"]`).doesNotExist();
    assert.dom(`[href="${urls.worker2}"]`).doesNotExist();
    assert.dom(NO_RESULTS_MSG_SELECTOR).includesText('No results found');
  });

  test('user can filter for workers by release_version', async function (assert) {
    featuresService.enable('byow');
    await visit(urls.globalScope);

    await click(`[href="${urls.workers}"]`);

    assert.dom(`[href="${urls.worker1}"]`).exists();
    assert.dom(`[href="${urls.worker2}"]`).exists();

    await click(FILTER_DROPDOWN_SELECTOR('release_version'));
    await click(`input[value="${instances.worker1.release_version}"]`);
    await click(FILTER_APPLY_BUTTON_SELECTOR);

    assert.dom(`[href="${urls.worker2}"]`).doesNotExist();
    assert.dom(`[href="${urls.worker1}"]`).exists();
  });
});
