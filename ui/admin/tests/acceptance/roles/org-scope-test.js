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
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import {
  GRANT_SCOPE_THIS,
  GRANT_SCOPE_CHILDREN,
  GRANT_SCOPE_DESCENDANTS,
} from 'api/models/role';

module('Acceptance | roles | org-scope', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  let confirmService;

  const SCOPE_TOGGLE_SELECTOR = (name) =>
    `.hds-form-toggle input[name="${name}"]`;
  const SCOPE_CHECKBOX_SELECTOR = (type, id) =>
    `tbody [data-test-${type}-scopes-table-row="${id}"] input`;
  const GRANT_SCOPE_ROW_SELECTOR = (id) =>
    `tbody [data-test-grant-scope-row="${id}"]`;
  const FILTER_DROPDOWN_SELECTOR = (name) =>
    `.search-filtering [name="${name}"] button`;
  const TABLE_ROW_SELECTOR = 'tbody tr';
  const TABLE_SCOPE_SELECTOR = 'tbody tr:nth-child(2) a';
  const TABLE_PARENT_SCOPE_SELECTOR = 'tbody tr:nth-child(2) td:nth-child(3) a';
  const SAVE_BTN_SELECTOR = 'form [type="submit"]';
  const CANCEL_BTN_SELECTOR = '.rose-form-actions [type="button"]';
  const MANAGE_DROPDOWN_SELECTOR = '.hds-dropdown-toggle-button';
  const MANAGE_SCOPES_SELECTOR = '[data-test-manage-dropdown-scopes]';
  const SEARCH_INPUT_SELECTOR = '.search-filtering [type="search"]';
  const NO_RESULTS_MSG_SELECTOR = '[data-test-no-grant-scope-results]';
  const NO_SCOPES_MSG_SELECTOR = '.role-grant-scopes div';
  const NO_SCOPES_MSG_LINK_SELECTOR =
    '.role-grant-scopes div div:nth-child(3) a';
  const BUTTON_ICON_SELECTOR =
    '.hds-button__icon [data-test-icon="check-circle"]';
  const PAGINATION_SELECTOR = '.hds-pagination';
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
    manageOrgProjects: null,
  };

  hooks.beforeEach(async function () {
    await authenticateSession({ username: 'admin' });
    confirmService = this.owner.lookup('service:confirm');

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
        scope: instances.scopes.org,
      },
      'withScopes',
    );

    urls.roles = `/scopes/${instances.scopes.org.id}/roles`;
    urls.role = `${urls.roles}/${instances.role.id}`;
    urls.roleScopes = `${urls.role}/scopes`;
    urls.manageScopes = `${urls.role}/manage-scopes`;
    urls.manageOrgProjects = `${urls.role}/manage-scopes/${instances.scopes.org.id}`;
  });

  test('visiting role scopes', async function (assert) {
    // TODO: address issue with ICU-15021
    // Failing due to a11y violation while in dark mode.
    // Investigating issue with styles not properly
    // being applied during test.
    const session = this.owner.lookup('service:session');
    session.set('data.theme', 'light');
    await visit(urls.role);

    await click(`[href="${urls.roleScopes}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.roleScopes);
    assert
      .dom(TABLE_ROW_SELECTOR)
      .exists({ count: instances.role.grant_scope_ids.length });
  });

  test('user can navigate to scope from role grant scopes', async function (assert) {
    await visit(urls.role);

    await click(`[href="${urls.roleScopes}"]`);
    await click(TABLE_SCOPE_SELECTOR);

    assert.strictEqual(
      currentURL(),
      `/scopes/${instances.role.grant_scope_ids[1]}/edit`,
    );
  });

  test('user can navigate to parent scope from role grant scopes', async function (assert) {
    await visit(urls.role);

    await click(`[href="${urls.roleScopes}"]`);
    await click(TABLE_PARENT_SCOPE_SELECTOR);

    assert.strictEqual(
      currentURL(),
      `/scopes/${instances.scopes.org.id}/scopes`,
    );
  });

  test('user can search for existing grant scope on a role', async function (assert) {
    await visit(urls.role);

    await click(`[href="${urls.roleScopes}"]`);

    assert
      .dom(GRANT_SCOPE_ROW_SELECTOR(instances.role.grant_scope_ids[0]))
      .exists();
    assert
      .dom(GRANT_SCOPE_ROW_SELECTOR(instances.role.grant_scope_ids[1]))
      .exists();

    await fillIn(SEARCH_INPUT_SELECTOR, instances.role.grant_scope_ids[0]);
    await waitUntil(
      () =>
        findAll(GRANT_SCOPE_ROW_SELECTOR(instances.role.grant_scope_ids[1]))
          .length === 0,
    );

    assert.dom(PAGINATION_SELECTOR).exists();
    assert
      .dom(GRANT_SCOPE_ROW_SELECTOR(instances.role.grant_scope_ids[0]))
      .exists();
    assert
      .dom(GRANT_SCOPE_ROW_SELECTOR(instances.role.grant_scope_ids[1]))
      .doesNotExist();
  });

  test('user can search for grant scopes on a role and get no results', async function (assert) {
    await visit(urls.role);

    await click(`[href="${urls.roleScopes}"]`);

    assert
      .dom(GRANT_SCOPE_ROW_SELECTOR(instances.role.grant_scope_ids[0]))
      .exists();
    assert
      .dom(GRANT_SCOPE_ROW_SELECTOR(instances.role.grant_scope_ids[1]))
      .exists();

    await fillIn(SEARCH_INPUT_SELECTOR, 'fake scope that does not exist');
    await waitUntil(() => findAll(NO_RESULTS_MSG_SELECTOR).length === 1);

    assert
      .dom(GRANT_SCOPE_ROW_SELECTOR(instances.role.grant_scope_ids[0]))
      .doesNotExist();
    assert
      .dom(GRANT_SCOPE_ROW_SELECTOR(instances.role.grant_scope_ids[1]))
      .doesNotExist();
    assert.dom(NO_RESULTS_MSG_SELECTOR).includesText('No results found');
  });

  test('user cannot filter grant scopes on an org level role', async function (assert) {
    await visit(urls.role);

    await click(`[href="${urls.roleScopes}"]`);

    assert.dom(FILTER_DROPDOWN_SELECTOR('parent-scope')).doesNotExist();
    assert.dom(FILTER_DROPDOWN_SELECTOR('type')).doesNotExist();
  });

  test('user sees no scopes message and action when role has no grant scopes', async function (assert) {
    instances.role.update({ grant_scope_ids: [] });
    await visit(urls.role);

    await click(`[href="${urls.roleScopes}"]`);

    assert.dom(NO_SCOPES_MSG_SELECTOR).includesText('No scopes added');
    assert.dom(NO_SCOPES_MSG_LINK_SELECTOR).isVisible();
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

    assert.dom(NO_SCOPES_MSG_LINK_SELECTOR).doesNotExist();
  });

  test('correct toggles are visible for org level role on manage scopes page', async function (assert) {
    await visit(urls.role);

    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(MANAGE_SCOPES_SELECTOR);

    assert.strictEqual(currentURL(), urls.manageScopes);
    assert.dom(SCOPE_TOGGLE_SELECTOR(GRANT_SCOPE_THIS)).isVisible();
    assert.dom(SCOPE_TOGGLE_SELECTOR(GRANT_SCOPE_CHILDREN)).isVisible();
    assert.dom(SCOPE_TOGGLE_SELECTOR(GRANT_SCOPE_DESCENDANTS)).doesNotExist();
  });

  test('user can save scope keywords to add on manage scopes page', async function (assert) {
    instances.role.update({ grant_scope_ids: [] });
    await visit(urls.role);

    await click(`[href="${urls.roleScopes}"]`);

    assert.strictEqual(findAll(TABLE_ROW_SELECTOR).length, 0);

    await click(MANAGE_DROPDOWN_SELECTOR);
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

    await click(MANAGE_DROPDOWN_SELECTOR);
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

    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(MANAGE_SCOPES_SELECTOR);
    await click(SCOPE_TOGGLE_SELECTOR(GRANT_SCOPE_THIS));
    await click(SAVE_BTN_SELECTOR);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).isVisible();
  });

  test('user is prompted to confirm exit when there are unsaved changes on manage scopes page', async function (assert) {
    instances.role.update({ grant_scope_ids: [] });
    confirmService.enabled = true;
    await visit(urls.role);

    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(MANAGE_SCOPES_SELECTOR);
    await click(SCOPE_TOGGLE_SELECTOR(GRANT_SCOPE_THIS));
    await click(`[href="${urls.roles}"]`);

    assert.dom(commonSelectors.MODAL_WARNING).isVisible();

    await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN);

    assert.strictEqual(currentURL(), urls.roles);
  });

  test('user user can cancel transition when there are unsaved changes on manage scopes page', async function (assert) {
    instances.role.update({ grant_scope_ids: [] });
    confirmService.enabled = true;
    await visit(urls.role);

    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(MANAGE_SCOPES_SELECTOR);
    await click(SCOPE_TOGGLE_SELECTOR(GRANT_SCOPE_THIS));
    await click(`[href="${urls.roles}"]`);

    assert.dom(commonSelectors.MODAL_WARNING).isVisible();

    await click(commonSelectors.MODAL_WARNING_CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.manageScopes);
  });

  test('user can save custom scopes to add on manage org projects page', async function (assert) {
    instances.role.update({ grant_scope_ids: [] });
    await visit(urls.role);

    await click(`[href="${urls.roleScopes}"]`);

    assert.strictEqual(findAll(TABLE_ROW_SELECTOR).length, 0);

    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(MANAGE_SCOPES_SELECTOR);
    await click(`[href="${urls.manageOrgProjects}"]`);
    await a11yAudit();

    // Click three times to select, unselect, then reselect (for coverage)
    await click(
      SCOPE_CHECKBOX_SELECTOR('project', instances.scopes.project.id),
    );
    await click(
      SCOPE_CHECKBOX_SELECTOR('project', instances.scopes.project.id),
    );
    await click(
      SCOPE_CHECKBOX_SELECTOR('project', instances.scopes.project.id),
    );
    await click(SAVE_BTN_SELECTOR);

    assert.strictEqual(currentURL(), urls.manageScopes);
    assert.dom(BUTTON_ICON_SELECTOR).isVisible();

    await click(SAVE_BTN_SELECTOR);

    assert.strictEqual(currentURL(), urls.roleScopes);
    assert.strictEqual(findAll(TABLE_ROW_SELECTOR).length, 1);
  });

  test('user can cancel custom scopes to add on manage org projects page', async function (assert) {
    instances.role.update({ grant_scope_ids: [] });
    await visit(urls.role);

    await click(`[href="${urls.roleScopes}"]`);

    assert.strictEqual(findAll(TABLE_ROW_SELECTOR).length, 0);

    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(MANAGE_SCOPES_SELECTOR);
    await click(`[href="${urls.manageOrgProjects}"]`);
    await a11yAudit();

    // Click three times to select, unselect, then reselect (for coverage)
    await click(
      SCOPE_CHECKBOX_SELECTOR('project', instances.scopes.project.id),
    );
    await click(
      SCOPE_CHECKBOX_SELECTOR('project', instances.scopes.project.id),
    );
    await click(
      SCOPE_CHECKBOX_SELECTOR('project', instances.scopes.project.id),
    );
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

    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(MANAGE_SCOPES_SELECTOR);
    await click(`[href="${urls.manageOrgProjects}"]`);
    await click(
      SCOPE_CHECKBOX_SELECTOR('project', instances.scopes.project.id),
    );
    await click(SAVE_BTN_SELECTOR);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).isVisible();
  });

  test('user is prompted to confirm exit when there are unsaved changes on manage org projects page', async function (assert) {
    instances.role.update({ grant_scope_ids: [] });
    confirmService.enabled = true;
    await visit(urls.manageScopes);

    await click(`[href="${urls.manageOrgProjects}"]`);
    await click(
      SCOPE_CHECKBOX_SELECTOR('project', instances.scopes.project.id),
    );
    await click(`[href="${urls.roles}"]`);

    assert.dom(commonSelectors.MODAL_WARNING).isVisible();

    await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN);

    assert.strictEqual(currentURL(), urls.roles);
  });

  test('user user can cancel transition when there are unsaved changes on manage org projects page', async function (assert) {
    instances.role.update({ grant_scope_ids: [] });
    confirmService.enabled = true;
    await visit(urls.manageScopes);

    await click(`[href="${urls.manageOrgProjects}"]`);
    await click(
      SCOPE_CHECKBOX_SELECTOR('project', instances.scopes.project.id),
    );
    await click(`[href="${urls.roles}"]`);

    assert.dom(commonSelectors.MODAL_WARNING).isVisible();

    await click(commonSelectors.MODAL_WARNING_CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.manageOrgProjects);
  });

  test('user can search for a specific project scope by id on manage org projects page', async function (assert) {
    const anotherProject = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    await visit(urls.role);

    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(MANAGE_SCOPES_SELECTOR);
    await click(`[href="${urls.manageOrgProjects}"]`);

    assert
      .dom(SCOPE_CHECKBOX_SELECTOR('project', instances.scopes.project.id))
      .exists();
    assert.dom(SCOPE_CHECKBOX_SELECTOR('project', anotherProject.id)).exists();

    await fillIn(SEARCH_INPUT_SELECTOR, instances.scopes.project.id);
    await waitUntil(
      () =>
        findAll(SCOPE_CHECKBOX_SELECTOR('project', anotherProject.id))
          .length === 0,
    );

    assert
      .dom(SCOPE_CHECKBOX_SELECTOR('project', instances.scopes.project.id))
      .exists();
    assert
      .dom(SCOPE_CHECKBOX_SELECTOR('project', anotherProject.id))
      .doesNotExist();
  });

  test('user can search for project scopes and get no results on manage org projects page', async function (assert) {
    const anotherProject = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    await visit(urls.role);

    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(MANAGE_SCOPES_SELECTOR);
    await click(`[href="${urls.manageOrgProjects}"]`);

    assert
      .dom(SCOPE_CHECKBOX_SELECTOR('project', instances.scopes.project.id))
      .exists();
    assert.dom(SCOPE_CHECKBOX_SELECTOR('project', anotherProject.id)).exists();

    await fillIn(SEARCH_INPUT_SELECTOR, 'fake scope that does not exist');
    await waitUntil(() => findAll(NO_RESULTS_MSG_SELECTOR).length === 1);

    assert
      .dom(SCOPE_CHECKBOX_SELECTOR('project', instances.scopes.project.id))
      .doesNotExist();
    assert
      .dom(SCOPE_CHECKBOX_SELECTOR('project', anotherProject.id))
      .doesNotExist();
    assert.dom(NO_RESULTS_MSG_SELECTOR).includesText('No results found');
  });
});
