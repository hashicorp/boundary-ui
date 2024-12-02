/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, fillIn, waitUntil, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | users | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  const SEARCH_INPUT_SELECTOR = '.search-filtering [type="search"]';
  const NO_RESULTS_MSG_SELECTOR = '[data-test-no-user-results]';

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    user1: null,
    user2: null,
  };

  const urls = {
    globalScope: null,
    orgScope: null,
    users: null,
    user1: null,
    user2: null,
  };

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.user1 = this.server.create('user', {
      scope: instances.scopes.org,
    });
    instances.user2 = this.server.create('user', {
      scope: instances.scopes.org,
    });
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.users = `${urls.orgScope}/users`;
    urls.user1 = `${urls.users}/${instances.user1.id}`;
    urls.user2 = `${urls.users}/${instances.user2.id}`;
    authenticateSession({});
  });

  test('users can navigate to users with proper authorization', async function (assert) {
    await visit(urls.globalScope);

    await click(`[href="${urls.orgScope}"]`);

    assert.true(
      instances.scopes.org.authorized_collection_actions.users.includes('list'),
    );
    assert.true(
      instances.scopes.org.authorized_collection_actions.users.includes(
        'create',
      ),
    );

    assert.dom(`[href="${urls.users}"]`).exists();
  });

  test('user cannot navigate to users tab without either list or create actions', async function (assert) {
    instances.scopes.org.authorized_collection_actions.users = [];
    await visit(urls.globalScope);

    await click(`[href="${urls.orgScope}"]`);

    assert.false(
      instances.scopes.org.authorized_collection_actions.users.includes(
        'create',
      ),
    );
    assert.false(
      instances.scopes.org.authorized_collection_actions.users.includes('list'),
    );
    assert.dom(`nav [href="${urls.users}"]`).doesNotExist();
  });

  test('user can navigate to users tab with only create action', async function (assert) {
    instances.scopes.org.authorized_collection_actions.users =
      instances.scopes.org.authorized_collection_actions.users.filter(
        (item) => item !== 'list',
      );
    await visit(urls.globalScope);

    await click(`[href="${urls.orgScope}"]`);

    assert.false(
      instances.scopes.org.authorized_collection_actions.users.includes('list'),
    );
    assert.true(
      instances.scopes.org.authorized_collection_actions.users.includes(
        'create',
      ),
    );
    assert.dom(`[href="${urls.users}"]`).exists();

    await click(`[href="${urls.users}"]`);

    assert.dom(`.rose-table [href="${urls.user1}"]`).doesNotExist();
  });

  test('user can navigate to users tab with only list action', async function (assert) {
    instances.scopes.org.authorized_collection_actions.users =
      instances.scopes.org.authorized_collection_actions.users.filter(
        (item) => item !== 'create',
      );
    await visit(urls.globalScope);

    await click(`[href="${urls.orgScope}"]`);

    assert.true(
      instances.scopes.org.authorized_collection_actions.users.includes('list'),
    );
    assert.false(
      instances.scopes.org.authorized_collection_actions.users.includes(
        'create',
      ),
    );
    assert.dom(`[href="${urls.users}"]`).exists();

    await click(`[href="${urls.users}"]`);

    assert.dom(`[href="${urls.user1}"]`).exists();
  });

  test('user can search for a user by id', async function (assert) {
    await visit(urls.orgScope);

    await click(`[href="${urls.users}"]`);

    assert.dom(`[href="${urls.user1}"]`).exists();
    assert.dom(`[href="${urls.user2}"]`).exists();

    await fillIn(SEARCH_INPUT_SELECTOR, instances.user1.id);
    await waitUntil(() => findAll(`[href="${urls.user2}"]`).length === 0);

    assert.dom(`[href="${urls.user1}"]`).exists();
    assert.dom(`[href="${urls.user2}"]`).doesNotExist();
  });

  test('user can search for users and get no results', async function (assert) {
    await visit(urls.orgScope);

    await click(`[href="${urls.users}"]`);

    assert.dom(`[href="${urls.user1}"]`).exists();
    assert.dom(`[href="${urls.user2}"]`).exists();

    await fillIn(SEARCH_INPUT_SELECTOR, 'fake user that does not exist');
    await waitUntil(() => findAll(NO_RESULTS_MSG_SELECTOR).length === 1);

    assert.dom(`[href="${urls.user1}"]`).doesNotExist();
    assert.dom(`[href="${urls.user2}"]`).doesNotExist();
    assert.dom(NO_RESULTS_MSG_SELECTOR).includesText('No results found');
  });
});
