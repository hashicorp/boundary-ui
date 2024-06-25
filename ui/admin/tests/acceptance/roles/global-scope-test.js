/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  click,
  findAll,
  fillIn,
  waitUntil,
} from '@ember/test-helpers';
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

module('Acceptance | roles | global-scope', function (hooks) {
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
  const SEARCH_INPUT_SELECTOR = '.search-filtering [type="search"]';
  const NO_RESULTS_MSG_SELECTOR = '[data-test-no-scope-results]';

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    role: null,
  };
  const urls = {
    orgScope: null,
    roles: null,
    role: null,
    roleScopes: null,
    manageScopes: null,
    manageCustomScopes: null,
  };

  hooks.beforeEach(function () {
    authenticateSession({});
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    instances.role = this.server.create(
      'role',
      {
        scope: instances.scopes.global,
      },
      'withScopes',
    );

    urls.roles = `/scopes/global/roles`;
    urls.role = `${urls.roles}/${instances.role.id}`;
    urls.roleScopes = `${urls.role}/scopes`;
    urls.manageScopes = `${urls.role}/manage-scopes`;
    urls.manageCustomScopes = `${urls.manageScopes}/manage-custom-scopes`;
  });

  test('visiting role scopes', async function (assert) {
    await visit(urls.role);

    await click(`[href="${urls.roleScopes}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.roleScopes);
    assert
      .dom(TABLE_ROW_SELECTOR)
      .exists({ count: instances.role.grant_scope_ids.length });
  });

  test('user can naviage to scope from role grant scopes', async function (assert) {
    await visit(urls.role);

    await click(`[href="${urls.roleScopes}"]`);
    await click('tbody tr:nth-child(2) a');

    assert.strictEqual(
      currentURL(),
      `/scopes/${instances.scopes.global.id}/scopes`,
    );
  });

  test('user can naviage to parent scope from role grant scopes', async function (assert) {
    instances.role.update({
      grant_scope_ids: ['this', instances.scopes.org.id],
    });
    await visit(urls.role);

    await click(`[href="${urls.roleScopes}"]`);
    await click('tbody tr:nth-child(2) td:nth-child(3) a');

    assert.strictEqual(
      currentURL(),
      `/scopes/${instances.scopes.global.id}/scopes`,
    );
  });

  test('user sees no scopes message and action when role has no grant scopes', async function (assert) {
    instances.role.update({ grant_scope_ids: [] });
    await visit(urls.role);

    await click(`[href="${urls.roleScopes}"]`);

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
    await visit(urls.role);

    await click(`[href="${urls.roleScopes}"]`);

    assert.dom('.role-grant-scopes div div:nth-child(3) a').doesNotExist();
  });

  test('correct toggles are visible for global level role on manage scopes page', async function (assert) {
    await visit(urls.role);

    await click(MANAGE_SCOPES_SELECTOR);

    assert.strictEqual(currentURL(), urls.manageScopes);
    assert.dom(SCOPE_TOGGLE_SELECTOR(GRANT_SCOPE_THIS)).isVisible();
    assert.dom(SCOPE_TOGGLE_SELECTOR(GRANT_SCOPE_CHILDREN)).isVisible();
    assert.dom(SCOPE_TOGGLE_SELECTOR(GRANT_SCOPE_DESCENDANTS)).isVisible();
  });

  test('user can save scope keywords to add on manage scopes page', async function (assert) {
    instances.role.update({ grant_scope_ids: [] });
    await visit(urls.role);

    await click(`[href="${urls.roleScopes}"]`);

    assert.strictEqual(findAll(TABLE_ROW_SELECTOR).length, 0);

    await click(MANAGE_SCOPES_SELECTOR);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.manageScopes);

    // Click three times to select, unselect, then reselect (for coverage)
    await click(SCOPE_TOGGLE_SELECTOR(GRANT_SCOPE_THIS));
    await click(SCOPE_TOGGLE_SELECTOR(GRANT_SCOPE_THIS));
    await click(SCOPE_TOGGLE_SELECTOR(GRANT_SCOPE_THIS));
    await click(SAVE_BTN_SELECTOR);

    assert.strictEqual(currentURL(), urls.roleScopes);
    assert.strictEqual(findAll(TABLE_ROW_SELECTOR).length, 1);
  });

  test('user can cancel scope keywords to add on manage scopes page', async function (assert) {
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

  test('shows error message on scope save on manage scopes page', async function (assert) {
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

  test('user can save custom scopes to add on manage custom scopes page', async function (assert) {
    instances.role.update({ grant_scope_ids: [] });
    await visit(urls.role);

    await click(`[href="${urls.roleScopes}"]`);

    assert.strictEqual(findAll(TABLE_ROW_SELECTOR).length, 0);

    await click(MANAGE_SCOPES_SELECTOR);

    assert.strictEqual(currentURL(), urls.manageScopes);

    await click(`[href="${urls.manageCustomScopes}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.manageCustomScopes);

    // Click three times to select, unselect, then reselect (for coverage)
    await click(SCOPE_CHECKBOX_SELECTOR(instances.scopes.org.id));
    await click(SCOPE_CHECKBOX_SELECTOR(instances.scopes.org.id));
    await click(SCOPE_CHECKBOX_SELECTOR(instances.scopes.org.id));
    await click(SAVE_BTN_SELECTOR);

    assert.strictEqual(currentURL(), urls.manageScopes);

    await click(SAVE_BTN_SELECTOR);

    assert.strictEqual(currentURL(), urls.roleScopes);
    assert.strictEqual(findAll(TABLE_ROW_SELECTOR).length, 1);
  });

  test('user can cancel custom scopes to add on manage custom scopes page', async function (assert) {
    instances.role.update({ grant_scope_ids: [] });
    await visit(urls.role);

    await click(`[href="${urls.roleScopes}"]`);

    assert.strictEqual(findAll(TABLE_ROW_SELECTOR).length, 0);

    await click(MANAGE_SCOPES_SELECTOR);

    assert.strictEqual(currentURL(), urls.manageScopes);

    await click(`[href="${urls.manageCustomScopes}"]`);

    // Click three times to select, unselect, then reselect (for coverage)
    await click(SCOPE_CHECKBOX_SELECTOR(instances.scopes.org.id));
    await click(SCOPE_CHECKBOX_SELECTOR(instances.scopes.org.id));
    await click(SCOPE_CHECKBOX_SELECTOR(instances.scopes.org.id));
    await click(CANCEL_BTN_SELECTOR);

    assert.strictEqual(currentURL(), urls.manageScopes);

    await click(CANCEL_BTN_SELECTOR);

    assert.strictEqual(currentURL(), urls.roleScopes);
    assert.strictEqual(findAll(TABLE_ROW_SELECTOR).length, 0);
  });

  test('shows error message on custom scope save on manage custom scopes page', async function (assert) {
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
    await click(`[href="${urls.manageCustomScopes}"]`);
    await click(SCOPE_CHECKBOX_SELECTOR(instances.scopes.org.id));
    await click(SAVE_BTN_SELECTOR);

    assert.dom(TOAST_SELECTOR).isVisible();
  });

  test('user can search for a specifc org scope by id on manage custom scopes page', async function (assert) {
    const anotherOrg = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    await visit(urls.manageScopes);

    await click(`[href="${urls.manageCustomScopes}"]`);

    assert.dom(SCOPE_CHECKBOX_SELECTOR(instances.scopes.org.id)).exists();
    assert.dom(SCOPE_CHECKBOX_SELECTOR(anotherOrg.id)).exists();

    await fillIn(SEARCH_INPUT_SELECTOR, instances.scopes.org.id);
    await waitUntil(
      () => findAll(SCOPE_CHECKBOX_SELECTOR(anotherOrg.id)).length === 0,
    );

    assert.dom(SCOPE_CHECKBOX_SELECTOR(instances.scopes.org.id)).exists();
    assert.dom(SCOPE_CHECKBOX_SELECTOR(anotherOrg.id)).doesNotExist();
  });

  test('user can search for org scopes and get no results on manage custom scopes page', async function (assert) {
    const anotherOrg = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    await visit(urls.manageScopes);

    await click(`[href="${urls.manageCustomScopes}"]`);

    assert.dom(SCOPE_CHECKBOX_SELECTOR(instances.scopes.org.id)).exists();
    assert.dom(SCOPE_CHECKBOX_SELECTOR(anotherOrg.id)).exists();

    await fillIn(SEARCH_INPUT_SELECTOR, 'fake scope that does not exist');
    await waitUntil(() => findAll(NO_RESULTS_MSG_SELECTOR).length === 1);

    assert.dom(SCOPE_CHECKBOX_SELECTOR(instances.scopes.org.id)).doesNotExist();
    assert.dom(SCOPE_CHECKBOX_SELECTOR(anotherOrg.id)).doesNotExist();
    assert.dom(NO_RESULTS_MSG_SELECTOR).includesText('No results found');
  });

  test('user can save custom scopes to add on manage org projects page', async function (assert) {
    instances.role.update({ grant_scope_ids: [] });
    await visit(urls.role);

    await click(`[href="${urls.roleScopes}"]`);

    assert.strictEqual(findAll(TABLE_ROW_SELECTOR).length, 0);

    await click(MANAGE_SCOPES_SELECTOR);
    await click(`[href="${urls.manageCustomScopes}"]`);
    await click(
      `tbody [href="${urls.manageScopes}/${instances.scopes.org.id}"]`,
    );
    await a11yAudit();

    // Click three times to select, unselect, then reselect (for coverage)
    await click(SCOPE_CHECKBOX_SELECTOR(instances.scopes.project.id));
    await click(SCOPE_CHECKBOX_SELECTOR(instances.scopes.project.id));
    await click(SCOPE_CHECKBOX_SELECTOR(instances.scopes.project.id));
    await click(SAVE_BTN_SELECTOR);

    assert.strictEqual(currentURL(), urls.manageCustomScopes);

    await click(SAVE_BTN_SELECTOR);

    assert.strictEqual(currentURL(), urls.manageScopes);

    await click(SAVE_BTN_SELECTOR);

    assert.strictEqual(currentURL(), urls.roleScopes);
    assert.strictEqual(findAll(TABLE_ROW_SELECTOR).length, 1);
  });

  test('user can cancel custom scopes to add on manage org projects page', async function (assert) {
    instances.role.update({ grant_scope_ids: [] });
    await visit(urls.role);

    await click(`[href="${urls.roleScopes}"]`);

    assert.strictEqual(findAll(TABLE_ROW_SELECTOR).length, 0);

    await click(MANAGE_SCOPES_SELECTOR);
    await click(`[href="${urls.manageCustomScopes}"]`);
    await click(
      `tbody [href="${urls.manageScopes}/${instances.scopes.org.id}"]`,
    );

    // Click three times to select, unselect, then reselect (for coverage)
    await click(SCOPE_CHECKBOX_SELECTOR(instances.scopes.project.id));
    await click(SCOPE_CHECKBOX_SELECTOR(instances.scopes.project.id));
    await click(SCOPE_CHECKBOX_SELECTOR(instances.scopes.project.id));
    await click(CANCEL_BTN_SELECTOR);

    assert.strictEqual(currentURL(), urls.manageCustomScopes);

    await click(CANCEL_BTN_SELECTOR);

    assert.strictEqual(currentURL(), urls.manageScopes);

    await click(CANCEL_BTN_SELECTOR);

    assert.strictEqual(currentURL(), urls.roleScopes);
    assert.strictEqual(findAll(TABLE_ROW_SELECTOR).length, 0);
  });

  test('shows error message on custom scope save on manage org projects page', async function (assert) {
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
    await click(`[href="${urls.manageCustomScopes}"]`);
    await click(
      `tbody [href="${urls.manageScopes}/${instances.scopes.org.id}"]`,
    );
    await click(SCOPE_CHECKBOX_SELECTOR(instances.scopes.project.id));
    await click(SAVE_BTN_SELECTOR);

    assert.dom(TOAST_SELECTOR).isVisible();
  });

  test('user can search for a specifc project scope by id on manage org projects page', async function (assert) {
    const anotherProject = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    await visit(urls.role);

    await click(MANAGE_SCOPES_SELECTOR);
    await click(`[href="${urls.manageCustomScopes}"]`);
    await click(
      `tbody [href="${urls.manageScopes}/${instances.scopes.org.id}"]`,
    );

    assert.dom(SCOPE_CHECKBOX_SELECTOR(instances.scopes.project.id)).exists();
    assert.dom(SCOPE_CHECKBOX_SELECTOR(anotherProject.id)).exists();

    await fillIn(SEARCH_INPUT_SELECTOR, instances.scopes.project.id);
    await waitUntil(
      () => findAll(SCOPE_CHECKBOX_SELECTOR(anotherProject.id)).length === 0,
    );

    assert.dom(SCOPE_CHECKBOX_SELECTOR(instances.scopes.project.id)).exists();
    assert.dom(SCOPE_CHECKBOX_SELECTOR(anotherProject.id)).doesNotExist();
  });

  test('user can search for project scopes and get no results on manage org projects page', async function (assert) {
    const anotherProject = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    await visit(urls.role);

    await click(MANAGE_SCOPES_SELECTOR);
    await click(`[href="${urls.manageCustomScopes}"]`);
    await click(
      `tbody [href="${urls.manageScopes}/${instances.scopes.org.id}"]`,
    );

    assert.dom(SCOPE_CHECKBOX_SELECTOR(instances.scopes.project.id)).exists();
    assert.dom(SCOPE_CHECKBOX_SELECTOR(anotherProject.id)).exists();

    await fillIn(SEARCH_INPUT_SELECTOR, 'fake scope that does not exist');
    await waitUntil(() => findAll(NO_RESULTS_MSG_SELECTOR).length === 1);

    assert
      .dom(SCOPE_CHECKBOX_SELECTOR(instances.scopes.project.id))
      .doesNotExist();
    assert.dom(SCOPE_CHECKBOX_SELECTOR(anotherProject.id)).doesNotExist();
    assert.dom(NO_RESULTS_MSG_SELECTOR).includesText('No results found');
  });
});
