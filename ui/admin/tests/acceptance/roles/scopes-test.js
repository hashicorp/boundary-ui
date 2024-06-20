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
import {
  GRANT_SCOPE_THIS,
  GRANT_SCOPE_CHILDREN,
  GRANT_SCOPE_DESCENDANTS,
} from 'api/models/role';

module('Acceptance | roles | scopes', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  const SCOPE_TOGGLE_SELECTOR = (name) =>
    `.hds-form-toggle input[name="${name}"]`;
  const SCOPE_CHECKBOX_SELECTOR = (id) =>
    `tbody [data-test-org-scopes-table-row="${id}"] input`;
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
    globalRole: null,
    orgRole: null,
  };
  const urls = {
    orgScope: null,
    globalRoles: null,
    globalRole: null,
    globalRoleScopes: null,
    globalManageScopes: null,
    orgRoles: null,
    orgRole: null,
    orgRoleScopes: null,
    orgManageScopes: null,
    manageCustomScopes: null,
  };

  hooks.beforeEach(function () {
    authenticateSession({});
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.globalRole = this.server.create(
      'role',
      {
        scope: instances.scopes.global,
      },
      'withScopes',
    );
    instances.orgRole = this.server.create(
      'role',
      {
        scope: instances.scopes.org,
      },
      'withScopes',
    );

    urls.globalRoles = `/scopes/global/roles`;
    urls.globalRole = `${urls.globalRoles}/${instances.globalRole.id}`;
    urls.globalRoleScopes = `${urls.globalRole}/scopes`;
    urls.globalManageScopes = `${urls.globalRole}/manage-scopes`;
    urls.manageCustomScopes = `${urls.globalManageScopes}/manage-custom-scopes`;
    urls.orgRoles = `/scopes/${instances.scopes.org.id}/roles`;
    urls.orgRole = `${urls.orgRoles}/${instances.orgRole.id}`;
    urls.orgRoleScopes = `${urls.orgRole}/scopes`;
    urls.orgManageScopes = `${urls.orgRole}/manage-scopes`;
  });

  test('visiting role scopes', async function (assert) {
    await visit(urls.orgRoleScopes);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.orgRoleScopes);
    assert
      .dom(TABLE_ROW_SELECTOR)
      .exists({ count: instances.orgRole.grant_scope_ids.length });
  });

  test('user can naviage to scope from role grant scopes', async function (assert) {
    await visit(urls.orgRoleScopes);
    await click('tbody tr:nth-child(2) a');
    assert.strictEqual(
      currentURL(),
      `/scopes/${instances.scopes.org.id}/scopes`,
    );
  });

  test('user can naviage to parent scope from role grant scopes', async function (assert) {
    await visit(urls.orgRoleScopes);
    await click('tbody tr:nth-child(2) td:nth-child(3) a');
    assert.strictEqual(
      currentURL(),
      `/scopes/${instances.scopes.global.id}/scopes`,
    );
  });

  test('user sees no scopes message and action when role has no grant scopes', async function (assert) {
    instances.orgRole.update({ grant_scope_ids: [] });
    await visit(urls.orgRoleScopes);
    assert.dom('.role-grant-scopes div').includesText('No scopes added');
    assert.dom('.role-grant-scopes div div:nth-child(3) a').isVisible();
  });

  test('user does not see action to add scopes when role has no grant scopes without proper permissions', async function (assert) {
    instances.orgRole.update({
      grant_scope_ids: [],
      authorized_actions: instances.orgRole.authorized_actions.filter(
        (action) => action !== 'set-grant-scopes',
      ),
    });
    await visit(urls.orgRoleScopes);
    assert.dom('.role-grant-scopes div div:nth-child(3) a').doesNotExist();
  });

  test('toggle and save scope keywords to add', async function (assert) {
    instances.orgRole.update({ grant_scope_ids: [] });
    await visit(urls.orgRole);

    await click(`[href="${urls.orgRoleScopes}"]`);

    assert.strictEqual(findAll(TABLE_ROW_SELECTOR).length, 0);

    await click(MANAGE_SCOPES_SELECTOR);

    assert.strictEqual(currentURL(), urls.orgManageScopes);

    // Click three times to select, unselect, then reselect (for coverage)
    await click(SCOPE_TOGGLE_SELECTOR(GRANT_SCOPE_THIS));
    await click(SCOPE_TOGGLE_SELECTOR(GRANT_SCOPE_THIS));
    await click(SCOPE_TOGGLE_SELECTOR(GRANT_SCOPE_THIS));
    await click(SAVE_BTN_SELECTOR);

    assert.strictEqual(currentURL(), urls.orgRoleScopes);
    assert.strictEqual(findAll(TABLE_ROW_SELECTOR).length, 1);
  });

  test('correct toggles are visible for global level role', async function (assert) {
    await visit(urls.globalRole);

    await click(MANAGE_SCOPES_SELECTOR);

    assert.strictEqual(currentURL(), urls.globalManageScopes);
    assert.dom(SCOPE_TOGGLE_SELECTOR(GRANT_SCOPE_THIS)).isVisible();
    assert.dom(SCOPE_TOGGLE_SELECTOR(GRANT_SCOPE_CHILDREN)).isVisible();
    assert.dom(SCOPE_TOGGLE_SELECTOR(GRANT_SCOPE_DESCENDANTS)).isVisible();
  });

  test('correct toggles are visible for org level role', async function (assert) {
    await visit(urls.orgRole);

    await click(MANAGE_SCOPES_SELECTOR);

    assert.strictEqual(currentURL(), urls.orgManageScopes);
    assert.dom(SCOPE_TOGGLE_SELECTOR(GRANT_SCOPE_THIS)).isVisible();
    assert.dom(SCOPE_TOGGLE_SELECTOR(GRANT_SCOPE_CHILDREN)).isVisible();
    assert.dom(SCOPE_TOGGLE_SELECTOR(GRANT_SCOPE_DESCENDANTS)).doesNotExist();
  });

  test('toggle and cancel scope keywords to add', async function (assert) {
    instances.orgRole.update({ grant_scope_ids: [] });
    await visit(urls.orgRole);

    await click(`[href="${urls.orgRoleScopes}"]`);

    assert.strictEqual(findAll(TABLE_ROW_SELECTOR).length, 0);

    await click(MANAGE_SCOPES_SELECTOR);

    assert.strictEqual(currentURL(), urls.orgManageScopes);

    // Click three times to select, unselect, then reselect (for coverage)
    await click(SCOPE_TOGGLE_SELECTOR(GRANT_SCOPE_THIS));
    await click(SCOPE_TOGGLE_SELECTOR(GRANT_SCOPE_THIS));
    await click(SCOPE_TOGGLE_SELECTOR(GRANT_SCOPE_THIS));
    await click(CANCEL_BTN_SELECTOR);

    assert.strictEqual(currentURL(), urls.orgRoleScopes);
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
    instances.orgRole.update({ grant_scope_ids: [] });
    await visit(urls.orgRole);

    await click(MANAGE_SCOPES_SELECTOR);
    await click(SCOPE_TOGGLE_SELECTOR(GRANT_SCOPE_THIS));
    await click(SAVE_BTN_SELECTOR);

    assert.dom(TOAST_SELECTOR).isVisible();
  });

  test('select and save custom scopes to add', async function (assert) {
    instances.globalRole.update({ grant_scope_ids: [] });
    await visit(urls.globalRole);

    await click(`[href="${urls.globalRoleScopes}"]`);

    assert.strictEqual(findAll(TABLE_ROW_SELECTOR).length, 0);

    await click(MANAGE_SCOPES_SELECTOR);

    assert.strictEqual(currentURL(), urls.globalManageScopes);

    await click(`[href="${urls.manageCustomScopes}"]`);

    // Click three times to select, unselect, then reselect (for coverage)
    await click(SCOPE_CHECKBOX_SELECTOR(instances.scopes.org.id));
    await click(SCOPE_CHECKBOX_SELECTOR(instances.scopes.org.id));
    await click(SCOPE_CHECKBOX_SELECTOR(instances.scopes.org.id));
    await click(SAVE_BTN_SELECTOR);

    assert.strictEqual(currentURL(), urls.globalManageScopes);

    await click(SAVE_BTN_SELECTOR);

    assert.strictEqual(currentURL(), urls.globalRoleScopes);
    assert.strictEqual(findAll(TABLE_ROW_SELECTOR).length, 1);
  });

  test('shows error message on custom scope save', async function (assert) {
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
    instances.globalRole.update({ grant_scope_ids: [] });
    await visit(urls.globalRole);

    await click(MANAGE_SCOPES_SELECTOR);
    await click(`[href="${urls.manageCustomScopes}"]`);
    await click(SCOPE_CHECKBOX_SELECTOR(instances.scopes.org.id));
    await click(SAVE_BTN_SELECTOR);

    assert.dom(TOAST_SELECTOR).isVisible();
  });
});
