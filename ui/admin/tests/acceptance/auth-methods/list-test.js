/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, waitFor, fillIn, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import {
  currentSession,
  authenticateSession,
} from 'ember-simple-auth/test-support';
import { Response } from 'miragejs';
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
    orgAuthMethods: null,
    globalAuthMethods: null,
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
    urls.globalScope = `/scopes/global`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.authMethods = `/scopes/${instances.scopes.org.id}/auth-methods`;
    urls.globalAuthMethods = `${urls.globalScope}/auth-methods`;
    urls.orgAuthMethods = `${urls.orgScope}/auth-methods`;
    urls.passwordAuthMethod = `${urls.authMethods}/${instances.passwordAuthMethod.id}`;
    urls.oidcAuthMethod = `${urls.authMethods}/${instances.oidcAuthMethod.id}`;

    authenticateSession({ username: 'admin' });
  });

  module('a11yAudit', function () {
    test.each('auth-methods', ['light', 'dark'], async function (assert, data) {
      assert.expect(0);
      currentSession().set('data.theme', data);
      await visit(urls.authMethods);

      // open new dropdown
      await click('.rose-layout-page-actions button');
      await a11yAudit();

      // open dropdown at last row
      await click('td:last-child button');
      await a11yAudit();

      // open primary filter
      await click('.hds-segmented-group div[name="primary"] div button');
      await a11yAudit();

      // check 'yes'
      await click(
        '.hds-segmented-group div[name="primary"] div:last-child input',
      );
      await a11yAudit();

      // filter selected
      await click(FILTER_DROPDOWN_SELECTOR('type'));
      await click(`input[value="${TYPE_AUTH_METHOD_PASSWORD}"]`);
      await click(FILTER_APPLY_BUTTON_SELECTOR);
      await a11yAudit();

      // "no results" message
      await fillIn(
        SEARCH_INPUT_SELECTOR,
        'fake auth method that does not exist',
      );
      await a11yAudit();
    });

    test('API error', async function (assert) {
      assert.expect(0);
      this.server.get('/auth-methods', () => {
        return new Response(
          418,
          {},
          {
            status: 418,
            code: "I'm a teapot",
            message: 'Ope, sorry about that!',
          },
        );
      });

      await visit(urls.globalAuthMethods);
      await a11yAudit();

      currentSession().set('data.theme', 'dark');
      await a11yAudit();
    });
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

  test('visiting auth methods in org scope', async function (assert) {
    await visit(urls.orgScope);

    await click(`[href="${urls.orgAuthMethods}"]`);

    assert.strictEqual(currentURL(), urls.orgAuthMethods);
  });

  test('visiting auth methods in global scope', async function (assert) {
    await visit(urls.globalScope);

    await click(`[href="${urls.globalAuthMethods}"]`);

    assert.strictEqual(currentURL(), urls.globalAuthMethods);
  });

  test('user can search for a specifc auth-method by id', async function (assert) {
    await visit(urls.orgScope);

    await click(`[href="${urls.authMethods}"]`);

    assert.dom(`[href="${urls.passwordAuthMethod}"]`).exists();
    assert.dom(`[href="${urls.oidcAuthMethod}"]`).exists();

    await fillIn(SEARCH_INPUT_SELECTOR, instances.passwordAuthMethod.id);
    await waitFor(`[href="${urls.oidcAuthMethod}"]`, { count: 0 });

    assert.dom(`[href="${urls.passwordAuthMethod}"]`).exists();
    assert.dom(`[href="${urls.oidcAuthMethod}"]`).doesNotExist();
  });

  test('user can search for auth-methods and get no results', async function (assert) {
    await visit(urls.orgScope);

    await click(`[href="${urls.authMethods}"]`);

    assert.dom(`[href="${urls.passwordAuthMethod}"]`).exists();
    assert.dom(`[href="${urls.oidcAuthMethod}"]`).exists();

    await fillIn(SEARCH_INPUT_SELECTOR, 'fake auth method that does not exist');
    await waitFor(NO_RESULTS_MSG_SELECTOR, { count: 1 });

    assert.dom(`[href="${urls.passwordAuthMethod}"]`).doesNotExist();
    assert.dom(`[href="${urls.oidcAuthMethod}"]`).doesNotExist();
    assert.dom(NO_RESULTS_MSG_SELECTOR).includesText('No results found');
  });

  test('user can filter for auth-methods by type', async function (assert) {
    await visit(urls.orgScope);

    await click(`[href="${urls.authMethods}"]`);

    assert.dom(`[href="${urls.passwordAuthMethod}"]`).exists();
    assert.dom(`[href="${urls.oidcAuthMethod}"]`).exists();

    await click(FILTER_DROPDOWN_SELECTOR('type'));
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
    await click(FILTER_DROPDOWN_SELECTOR('primary'));
    await click(`input[value="true"]`);
    await click(FILTER_APPLY_BUTTON_SELECTOR);

    assert.dom(`[href="${urls.oidcAuthMethod}"]`).doesNotExist();
    assert.dom(`[href="${urls.passwordAuthMethod}"]`).exists();
  });
});
