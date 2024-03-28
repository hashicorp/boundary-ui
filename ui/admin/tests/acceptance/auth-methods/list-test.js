/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, click, findAll, waitUntil, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';
import {
  TYPE_AUTH_METHOD_PASSWORD,
  TYPE_AUTH_METHOD_OIDC,
} from 'api/models/auth-method';

module('Acceptance | auth-methods | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  const SEARCH_INPUT_SELECTOR = '.search-filtering [type="search"]';
  const NO_RESULTS_MSG_SELECTOR = '[data-test-no-auth-method-results]';
  const FILTER_DROPDOWN_SELECTOR = (name) =>
    `.search-filtering [name="${name}"] button`;
  const FILTER_APPLY_BUTTON_SELECTOR =
    '.search-filtering [data-test-dropdown-apply-button]';
  const AUTH_ACTIONS_SELECTOR = (id) =>
    `tbody [data-test-auth-methods-table-row="${id}"] .hds-table__td:last-child .hds-dropdown button`;
  const MAKE_PRIMARY_ACTION_SELECTOR = '[data-test-make-primary-action]';

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    passwordAuthMethod: null,
    oidcAuthMethod: null,
  };

  const urls = {
    globalScope: null,
    orgScope: null,
    authMethods: null,
    passwordAuthMethod: null,
    oidcAuthMethod: null,
  };

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create(
      'scope',
      {
        type: 'org',
        scope: { id: 'global', type: 'global' },
      },
      'withChildren',
    );
    instances.passwordAuthMethod = this.server.create('auth-method', {
      scope: instances.scopes.org,
      type: TYPE_AUTH_METHOD_PASSWORD,
    });
    instances.oidcAuthMethod = this.server.create('auth-method', {
      scope: instances.scopes.org,
      type: TYPE_AUTH_METHOD_OIDC,
    });
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.authMethods = `/scopes/${instances.scopes.org.id}/auth-methods`;
    urls.passwordAuthMethod = `${urls.authMethods}/${instances.passwordAuthMethod.id}`;
    urls.oidcAuthMethod = `${urls.authMethods}/${instances.oidcAuthMethod.id}`;

    authenticateSession({});
  });

  test('users can navigate to auth methods with proper authorization', async function (assert) {
    await visit(urls.globalScope);

    await click(`[href="${urls.orgScope}"]`);

    assert.true(
      instances.scopes.org.authorized_collection_actions[
        'auth-methods'
      ].includes('list'),
    );
    assert.dom(`[href="${urls.authMethods}"]`).exists();
  });

  test('users cannot navigate to index without either list or create actions', async function (assert) {
    instances.scopes.org.authorized_collection_actions['auth-methods'] = [];
    await visit(urls.globalScope);

    await click(`[href="${urls.orgScope}"]`);

    assert.false(
      instances.scopes.org.authorized_collection_actions[
        'auth-methods'
      ].includes('list'),
    );
    assert.dom(`[href="${urls.authMethods}"]`).doesNotExist();
  });

  test('users can navigate to index with only create action', async function (assert) {
    instances.scopes.org.authorized_collection_actions['auth-methods'] = [
      'create',
    ];
    await visit(urls.globalScope);

    await click(`[href="${urls.orgScope}"]`);

    assert.dom(`[href="${urls.authMethods}"]`).exists();
  });

  test('user can search for a specifc auth-method by id', async function (assert) {
    await visit(urls.orgScope);

    await click(`[href="${urls.authMethods}"]`);

    assert.dom(`[href="${urls.passwordAuthMethod}"]`).exists();
    assert.dom(`[href="${urls.oidcAuthMethod}"]`).exists();

    await fillIn(SEARCH_INPUT_SELECTOR, instances.passwordAuthMethod.id);
    await waitUntil(
      () => findAll(`[href="${urls.oidcAuthMethod}"]`).length === 0,
    );

    assert.dom(`[href="${urls.passwordAuthMethod}"]`).exists();
    assert.dom(`[href="${urls.oidcAuthMethod}"]`).doesNotExist();
  });

  test('user can search for auth-methods and get no results', async function (assert) {
    await visit(urls.orgScope);

    await click(`[href="${urls.authMethods}"]`);

    assert.dom(`[href="${urls.passwordAuthMethod}"]`).exists();
    assert.dom(`[href="${urls.oidcAuthMethod}"]`).exists();

    await fillIn(SEARCH_INPUT_SELECTOR, 'fake target that does not exist');
    await waitUntil(() => findAll(NO_RESULTS_MSG_SELECTOR).length === 1);

    assert.dom(`[href="${urls.passwordAuthMethod}"]`).doesNotExist();
    assert.dom(`[href="${urls.oidcAuthMethod}"]`).doesNotExist();
    assert.dom(NO_RESULTS_MSG_SELECTOR).includesText('No results found');
  });

  test('user can filter for auth-methods by type', async function (assert) {
    await visit(urls.orgScope);

    await click(`[href="${urls.authMethods}"]`);

    assert.dom(`[href="${urls.passwordAuthMethod}"]`).exists();
    assert.dom(`[href="${urls.oidcAuthMethod}"]`).exists();

    await click(FILTER_DROPDOWN_SELECTOR('Type'));
    await click(`input[value="${TYPE_AUTH_METHOD_PASSWORD}"]`);
    await click(FILTER_APPLY_BUTTON_SELECTOR);

    assert.dom(`[href="${urls.oidcAuthMethod}"]`).doesNotExist();
    assert.dom(`[href="${urls.passwordAuthMethod}"]`).exists();
  });

  test('user can filter for auth-methods by primary', async function (assert) {
    await visit(urls.orgScope);

    await click(`[href="${urls.authMethods}"]`);

    assert.dom(`[href="${urls.passwordAuthMethod}"]`).exists();
    assert.dom(`[href="${urls.oidcAuthMethod}"]`).exists();

    await click(AUTH_ACTIONS_SELECTOR(instances.passwordAuthMethod.id));
    await click(MAKE_PRIMARY_ACTION_SELECTOR);
    await click(FILTER_DROPDOWN_SELECTOR('Primary'));
    await click(`input[value="true"]`);
    await click(FILTER_APPLY_BUTTON_SELECTOR);

    assert.dom(`[href="${urls.oidcAuthMethod}"]`).doesNotExist();
    assert.dom(`[href="${urls.passwordAuthMethod}"]`).exists();
  });
});
