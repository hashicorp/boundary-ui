/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { GRANT_SCOPE_THIS } from 'api/models/role';

module('Acceptance | roles | scopes', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  const SCOPE_TOGGLE_SELECTOR = (name) =>
    `.hds-form-toggle input[name="${name}"]`;
  const TABLE_ROW_SELECTOR = 'tbody tr';
  const SAVE_BTN_SELECTOR = 'form [type="submit"]';
  const CANCEL_BTN_SELECTOR = '.rose-form-actions [type="button"]';
  const MANAGE_SCOPES_SELECTOR = '[data-test-manage-dropdown-scopes]';
  const TOAST_SELECTOR = '[role="alert"]';

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    role: null,
  };
  const urls = {
    orgScope: null,
    roles: null,
    role: null,
    roleScopes: null,
    manageScopes: null,
  };

  hooks.beforeEach(function () {
    authenticateSession({});
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.role = this.server.create(
      'role',
      {
        scope: instances.scopes.org,
      },
      'withScopes',
    );
    urls.roles = `/scopes/${instances.scopes.org.id}/roles`;
    urls.role = `${urls.roles}/${instances.role.id}`;
    urls.roleScopes = `${urls.role}/scopes`;
    urls.manageScopes = `${urls.role}/manage-scopes`;
  });

  test('visiting role scopes', async function (assert) {
    await visit(urls.roleScopes);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.roleScopes);
    assert
      .dom(TABLE_ROW_SELECTOR)
      .exists({ count: instances.role.grant_scope_ids.length });
  });

  test('user can naviage to scope from role grant scopes', async function (assert) {
    await visit(urls.roleScopes);
    await click('tbody tr:nth-child(2) a');
    assert.strictEqual(
      currentURL(),
      `/scopes/${instances.scopes.org.id}/scopes`,
    );
  });

  test('user can naviage to parent scope from role grant scopes', async function (assert) {
    await visit(urls.roleScopes);
    await click('tbody tr:nth-child(2) td:nth-child(3) a');
    assert.strictEqual(
      currentURL(),
      `/scopes/${instances.scopes.global.id}/scopes`,
    );
  });

  test('user sees no scopes message and action when role has no grant scopes', async function (assert) {
    instances.role.update({ grant_scope_ids: [] });
    await visit(urls.roleScopes);
    assert.dom('.role-grant-scopes div').includesText('No scopes added');
    assert.dom('.role-grant-scopes div div:nth-child(3) a').isVisible();
  });

  test('user does not see action to add scopes when role has no grant scopes without proper permissions', async function (assert) {
    instances.role.update({
      grant_scope_ids: [],
      authorized_actions: instances.role.authorized_actions.filter(
        (action) => action !== 'set-grant-scopes',
      ),
    });
    await visit(urls.roleScopes);
    assert.dom('.role-grant-scopes div div:nth-child(3) a').doesNotExist();
  });

  test('toggle and save scope keywords to add', async function (assert) {
    instances.role.update({ grant_scope_ids: [] });
    await visit(urls.role);

    await click(`[href="${urls.roleScopes}"]`);

    assert.strictEqual(findAll(TABLE_ROW_SELECTOR).length, 0);

    await click(MANAGE_SCOPES_SELECTOR);

    assert.strictEqual(currentURL(), urls.manageScopes);

    // Click three times to select, unselect, then reselect (for coverage)
    await click(SCOPE_TOGGLE_SELECTOR(GRANT_SCOPE_THIS));
    await click(SCOPE_TOGGLE_SELECTOR(GRANT_SCOPE_THIS));
    await click(SCOPE_TOGGLE_SELECTOR(GRANT_SCOPE_THIS));
    await click(SAVE_BTN_SELECTOR);

    assert.strictEqual(currentURL(), urls.roleScopes);
    assert.strictEqual(findAll(TABLE_ROW_SELECTOR).length, 1);
  });

  test('toggle and cancel scope keywords to add', async function (assert) {
    instances.role.update({ grant_scope_ids: [] });
    await visit(urls.role);

    await click(`[href="${urls.roleScopes}"]`);

    assert.strictEqual(findAll(TABLE_ROW_SELECTOR).length, 0);

    await click(MANAGE_SCOPES_SELECTOR);

    assert.strictEqual(currentURL(), urls.manageScopes);

    // Click three times to select, unselect, then reselect (for coverage)
    await click(SCOPE_TOGGLE_SELECTOR(GRANT_SCOPE_THIS));
    await click(SCOPE_TOGGLE_SELECTOR(GRANT_SCOPE_THIS));
    await click(SCOPE_TOGGLE_SELECTOR(GRANT_SCOPE_THIS));
    await click(CANCEL_BTN_SELECTOR);

    assert.strictEqual(currentURL(), urls.roleScopes);
    assert.strictEqual(findAll(TABLE_ROW_SELECTOR).length, 0);
  });

  test('shows error message on scope save', async function (assert) {
    this.server.post('/roles/:idMethod', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {},
        },
      );
    });
    instances.role.update({ grant_scope_ids: [] });
    await visit(urls.role);

    await click(MANAGE_SCOPES_SELECTOR);
    await click(SCOPE_TOGGLE_SELECTOR(GRANT_SCOPE_THIS));
    await click(SAVE_BTN_SELECTOR);

    assert.dom(TOAST_SELECTOR).isVisible();
  });
});
