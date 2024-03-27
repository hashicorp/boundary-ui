/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, findAll, click, fillIn, waitUntil } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | roles | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  const SEARCH_INPUT_SELECTOR = '.search-filtering [type="search"]';
  const NO_RESULTS_MSG_SELECTOR = '[data-test-no-role-results]';

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    role1: null,
    role2: null,
  };

  const urls = {
    globalScope: null,
    orgScope: null,
    roles: null,
    role1: null,
    role2: null,
  };

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.role1 = this.server.create('role', {
      scope: instances.scopes.org,
    });
    instances.role2 = this.server.create('role', {
      scope: instances.scopes.org,
    });
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.roles = `/scopes/${instances.scopes.org.id}/roles`;
    urls.role1 = `${urls.roles}/${instances.role1.id}`;
    urls.role2 = `${urls.roles}/${instances.role2.id}`;
    authenticateSession({});
  });

  test('users can navigate to roles with proper authorization', async function (assert) {
    await visit(urls.globalScope);

    await click(`[href="${urls.orgScope}"]`);

    assert.true(
      instances.scopes.org.authorized_collection_actions.roles.includes('list'),
    );
    assert.dom(`[href="${urls.roles}"]`).exists();
  });

  test('users cannot navigate to index without either list or create actions', async function (assert) {
    instances.scopes.org.authorized_collection_actions.roles = [];
    await visit(urls.globalScope);

    await click(`[href="${urls.orgScope}"]`);

    assert.false(
      instances.scopes.org.authorized_collection_actions.roles.includes('list'),
    );
    assert.dom(`[href="${urls.roles}"]`).doesNotExist();
  });

  test('users can navigate to index with only create action', async function (assert) {
    instances.scopes.org.authorized_collection_actions.roles = ['create'];
    await visit(urls.globalScope);

    await click(`[href="${urls.orgScope}"]`);

    assert.dom(`[href="${urls.roles}"]`).exists();
  });

  test('user can search for a specifc role by id', async function (assert) {
    await visit(urls.orgScope);

    await click(`[href="${urls.roles}"]`);

    assert.dom(`[href="${urls.role1}"]`).exists();
    assert.dom(`[href="${urls.role2}"]`).exists();

    await fillIn(SEARCH_INPUT_SELECTOR, instances.role1.id);
    await waitUntil(() => findAll(`[href="${urls.role2}"]`).length === 0);

    assert.dom(`[href="${urls.role1}"]`).exists();
    assert.dom(`[href="${urls.role2}"]`).doesNotExist();
  });

  test('user can search for roles and get no results', async function (assert) {
    await visit(urls.orgScope);

    await click(`[href="${urls.roles}"]`);

    assert.dom(`[href="${urls.role1}"]`).exists();
    assert.dom(`[href="${urls.role2}"]`).exists();

    await fillIn(SEARCH_INPUT_SELECTOR, 'fake role that does not exist');
    await waitUntil(() => findAll(NO_RESULTS_MSG_SELECTOR).length === 1);

    assert.dom(`[href="${urls.role1}"]`).doesNotExist();
    assert.dom(`[href="${urls.role2}"]`).doesNotExist();
    assert.dom(NO_RESULTS_MSG_SELECTOR).includesText('No results found');
  });
});
