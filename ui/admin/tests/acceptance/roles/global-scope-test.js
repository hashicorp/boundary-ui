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
import {
  GRANT_SCOPE_THIS,
  GRANT_SCOPE_CHILDREN,
  GRANT_SCOPE_DESCENDANTS,
} from 'api/models/role';
import { TYPE_SCOPE_ORG } from 'api/models/scope';
import * as selectors from './selectors';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | roles | global-scope', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  let confirmService;

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    role: null,
  };
  const urls = {
    roles: null,
    role: null,
    roleScopes: null,
    manageScopes: null,
    manageCustomScopes: null,
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
    // TODO: address issue with ICU-15021
    // Failing due to a11y violation while in dark mode.
    // Investigating issue with styles not properly
    // being applied during test.
    const session = this.owner.lookup('service:session');
    session.set('data.theme', 'light');
    await visit(urls.role);

    await click(commonSelectors.HREF(urls.roleScopes));
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.roleScopes);
    assert
      .dom(commonSelectors.TABLE_ROW)
      .exists({ count: instances.role.grant_scope_ids.length });
  });

  test('user can navigate to scope from role grant scopes', async function (assert) {
    const grantScopeUrl = `/scopes/${instances.role.grant_scope_ids[1]}`;
    await visit(urls.role);

    await click(commonSelectors.HREF(urls.roleScopes));
    await click(commonSelectors.TABLE_RESOURCE_LINK(grantScopeUrl));

    assert.strictEqual(currentURL(), `${grantScopeUrl}/scopes`);
  });

  test('user can search for existing grant scope on a role', async function (assert) {
    await visit(urls.role);

    await click(commonSelectors.HREF(urls.roleScopes));

    assert
      .dom(selectors.GRANT_SCOPE_ROW(instances.role.grant_scope_ids[0]))
      .isVisible();
    assert
      .dom(selectors.GRANT_SCOPE_ROW(instances.role.grant_scope_ids[1]))
      .isVisible();

    await fillIn(
      commonSelectors.SEARCH_INPUT,
      instances.role.grant_scope_ids[0],
    );
    await waitUntil(
      () =>
        findAll(selectors.GRANT_SCOPE_ROW(instances.role.grant_scope_ids[1]))
          .length === 0,
    );

    assert.dom(commonSelectors.PAGINATION).isVisible();
    assert
      .dom(selectors.GRANT_SCOPE_ROW(instances.role.grant_scope_ids[0]))
      .isVisible();
    assert
      .dom(selectors.GRANT_SCOPE_ROW(instances.role.grant_scope_ids[1]))
      .doesNotExist();
  });

  test('user can search for grant scopes on a role and get no results', async function (assert) {
    await visit(urls.role);

    await click(commonSelectors.HREF(urls.roleScopes));

    assert
      .dom(selectors.GRANT_SCOPE_ROW(instances.role.grant_scope_ids[0]))
      .isVisible();
    assert
      .dom(selectors.GRANT_SCOPE_ROW(instances.role.grant_scope_ids[1]))
      .isVisible();

    await fillIn(
      commonSelectors.SEARCH_INPUT,
      'fake scope that does not exist',
    );
    await waitUntil(
      () => findAll(selectors.NO_RESULTS_GRANT_SCOPE_MSG).length === 1,
    );

    assert
      .dom(selectors.GRANT_SCOPE_ROW(instances.role.grant_scope_ids[0]))
      .doesNotExist();
    assert
      .dom(selectors.GRANT_SCOPE_ROW(instances.role.grant_scope_ids[1]))
      .doesNotExist();
    assert
      .dom(selectors.NO_RESULTS_GRANT_SCOPE_MSG)
      .includesText('No results found');
  });

  test('user can filter for grant scopes on a role by parent scope', async function (assert) {
    await visit(urls.role);

    await click(commonSelectors.HREF(urls.roleScopes));

    assert
      .dom(selectors.GRANT_SCOPE_ROW(instances.role.grant_scope_ids[0]))
      .isVisible();
    assert
      .dom(selectors.GRANT_SCOPE_ROW(instances.role.grant_scope_ids[1]))
      .isVisible();

    await click(commonSelectors.FILTER_DROPDOWN('parent-scope'));
    await click(
      commonSelectors.FILTER_DROPDOWN_ITEM(instances.scopes.global.id),
    );
    await click(commonSelectors.FILTER_DROPDOWN_ITEM_APPLY_BTN('parent-scope'));

    assert
      .dom(selectors.GRANT_SCOPE_ROW(instances.role.grant_scope_ids[0]))
      .doesNotExist();
    assert
      .dom(selectors.GRANT_SCOPE_ROW(instances.role.grant_scope_ids[1]))
      .isVisible();
  });

  test('user can filter for grant scopes on a role by type', async function (assert) {
    await visit(urls.role);

    await click(commonSelectors.HREF(urls.roleScopes));

    assert
      .dom(selectors.GRANT_SCOPE_ROW(instances.role.grant_scope_ids[0]))
      .isVisible();
    assert
      .dom(selectors.GRANT_SCOPE_ROW(instances.role.grant_scope_ids[1]))
      .isVisible();

    await click(commonSelectors.FILTER_DROPDOWN('type'));
    await click(commonSelectors.FILTER_DROPDOWN_ITEM(TYPE_SCOPE_ORG));
    await click(commonSelectors.FILTER_DROPDOWN_ITEM_APPLY_BTN('type'));

    assert
      .dom(selectors.GRANT_SCOPE_ROW(instances.role.grant_scope_ids[0]))
      .doesNotExist();
    assert
      .dom(selectors.GRANT_SCOPE_ROW(instances.role.grant_scope_ids[1]))
      .isVisible();
  });

  test('user can navigate to parent scope from role grant scopes', async function (assert) {
    instances.role.update({
      grant_scope_ids: ['this', instances.scopes.org.id],
    });
    await visit(urls.role);

    await click(commonSelectors.HREF(urls.roleScopes));
    await click(selectors.GRANT_SCOPE_PARENT_SCOPE);

    assert.strictEqual(
      currentURL(),
      `/scopes/${instances.scopes.global.id}/scopes`,
    );
  });

  test('user sees no scopes message and action when role has no grant scopes', async function (assert) {
    instances.role.update({ grant_scope_ids: [] });
    await visit(urls.role);

    await click(commonSelectors.HREF(urls.roleScopes));

    assert.dom(selectors.NO_SCOPES_MSG).includesText('No scopes added');
    assert.dom(selectors.NO_SCOPES_MSG_LINK).isVisible();
  });

  test('user does not see action to add scopes when role has no grant scopes without proper permissions', async function (assert) {
    instances.role.update({
      grant_scope_ids: [],
      authorized_actions: instances.role.authorized_actions.filter(
        (action) => action !== 'set-grant-scopes',
      ),
    });
    await visit(urls.role);

    await click(commonSelectors.HREF(urls.roleScopes));

    assert.dom(selectors.NO_SCOPES_MSG_LINK).doesNotExist();
  });

  test('correct toggles are visible for global level role on manage scopes page', async function (assert) {
    await visit(urls.role);

    await click(selectors.MANAGE_DROPDOWN_ROLES);
    await click(selectors.MANAGE_DROPDOWN_ROLES_SCOPES);

    assert.strictEqual(currentURL(), urls.manageScopes);
    assert.dom(selectors.SCOPE_TOGGLE(GRANT_SCOPE_THIS)).isVisible();
    assert.dom(selectors.SCOPE_TOGGLE(GRANT_SCOPE_CHILDREN)).isVisible();
    assert.dom(selectors.SCOPE_TOGGLE(GRANT_SCOPE_DESCENDANTS)).isVisible();
  });

  test('user can save scope keywords to add on manage scopes page', async function (assert) {
    instances.role.update({ grant_scope_ids: [] });
    await visit(urls.role);

    await click(commonSelectors.HREF(urls.roleScopes));

    assert.dom(commonSelectors.TABLE_ROW).exists({ count: 0 });

    await click(selectors.MANAGE_DROPDOWN_ROLES);
    await click(selectors.MANAGE_DROPDOWN_ROLES_SCOPES);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.manageScopes);

    // Click three times to select, unselect, then reselect (for coverage)
    await click(selectors.SCOPE_TOGGLE(GRANT_SCOPE_THIS));
    await click(selectors.SCOPE_TOGGLE(GRANT_SCOPE_THIS));
    await click(selectors.SCOPE_TOGGLE(GRANT_SCOPE_THIS));
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.roleScopes);
    assert.dom(commonSelectors.TABLE_ROW).exists({ count: 1 });
  });

  test('user can cancel scope keywords to add on manage scopes page', async function (assert) {
    instances.role.update({ grant_scope_ids: [] });
    await visit(urls.role);

    await click(commonSelectors.HREF(urls.roleScopes));

    assert.dom(commonSelectors.TABLE_ROW).exists({ count: 0 });

    await click(selectors.MANAGE_DROPDOWN_ROLES);
    await click(selectors.MANAGE_DROPDOWN_ROLES_SCOPES);

    assert.strictEqual(currentURL(), urls.manageScopes);

    // Click three times to select, unselect, then reselect (for coverage)
    await click(selectors.SCOPE_TOGGLE(GRANT_SCOPE_THIS));
    await click(selectors.SCOPE_TOGGLE(GRANT_SCOPE_THIS));
    await click(selectors.SCOPE_TOGGLE(GRANT_SCOPE_THIS));
    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.roleScopes);
    assert.dom(commonSelectors.TABLE_ROW).exists({ count: 0 });
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

    await click(selectors.MANAGE_DROPDOWN_ROLES);
    await click(selectors.MANAGE_DROPDOWN_ROLES_SCOPES);
    await click(selectors.SCOPE_TOGGLE(GRANT_SCOPE_THIS));
    await click(commonSelectors.SAVE_BTN);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).isVisible();
  });

  test('user is prompted to confirm exit when there are unsaved changes on manage scopes page', async function (assert) {
    instances.role.update({ grant_scope_ids: [] });
    confirmService.enabled = true;
    await visit(urls.role);

    await click(selectors.MANAGE_DROPDOWN_ROLES);
    await click(selectors.MANAGE_DROPDOWN_ROLES_SCOPES);
    await click(selectors.SCOPE_TOGGLE(GRANT_SCOPE_THIS));
    await click(commonSelectors.HREF(urls.roles));

    assert.dom(commonSelectors.MODAL_WARNING).isVisible();

    await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN);

    assert.strictEqual(currentURL(), urls.roles);
  });

  test('user user can cancel transition when there are unsaved changes on manage scopes page', async function (assert) {
    instances.role.update({ grant_scope_ids: [] });
    confirmService.enabled = true;
    await visit(urls.role);

    await click(selectors.MANAGE_DROPDOWN_ROLES);
    await click(selectors.MANAGE_DROPDOWN_ROLES_SCOPES);
    await click(selectors.SCOPE_TOGGLE(GRANT_SCOPE_THIS));
    await click(commonSelectors.HREF(urls.roles));

    assert.dom(commonSelectors.MODAL_WARNING).isVisible();

    await click(commonSelectors.MODAL_WARNING_CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.manageScopes);
  });

  test('user can save custom scopes to add on manage custom scopes page', async function (assert) {
    // TODO: address issue with ICU-15021
    // Failing due to a11y violation while in dark mode.
    // Investigating issue with styles not properly
    // being applied during test.
    const session = this.owner.lookup('service:session');
    session.set('data.theme', 'light');
    instances.role.update({ grant_scope_ids: [] });
    await visit(urls.role);

    await click(commonSelectors.HREF(urls.roleScopes));

    assert.dom(commonSelectors.TABLE_ROW).exists({ count: 0 });

    await click(selectors.MANAGE_DROPDOWN_ROLES);
    await click(selectors.MANAGE_DROPDOWN_ROLES_SCOPES);

    assert.strictEqual(currentURL(), urls.manageScopes);

    await click(commonSelectors.HREF(urls.manageCustomScopes));
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.manageCustomScopes);

    // Click three times to select, unselect, then reselect (for coverage)
    await click(selectors.SCOPE_CHECKBOX('org', instances.scopes.org.id));
    await click(selectors.SCOPE_CHECKBOX('org', instances.scopes.org.id));
    await click(selectors.SCOPE_CHECKBOX('org', instances.scopes.org.id));
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.manageScopes);
    assert.dom(selectors.MANAGE_CUSTOM_SCOPES_BUTTON_ICON).isVisible();

    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.roleScopes);
    assert.dom(commonSelectors.TABLE_ROW).exists({ count: 1 });
  });

  test('user can cancel custom scopes to add on manage custom scopes page', async function (assert) {
    instances.role.update({ grant_scope_ids: [] });
    await visit(urls.role);

    await click(commonSelectors.HREF(urls.roleScopes));

    assert.dom(commonSelectors.TABLE_ROW).exists({ count: 0 });

    await click(selectors.MANAGE_DROPDOWN_ROLES);
    await click(selectors.MANAGE_DROPDOWN_ROLES_SCOPES);

    assert.strictEqual(currentURL(), urls.manageScopes);

    await click(commonSelectors.HREF(urls.manageCustomScopes));

    // Click three times to select, unselect, then reselect (for coverage)
    await click(selectors.SCOPE_CHECKBOX('org', instances.scopes.org.id));
    await click(selectors.SCOPE_CHECKBOX('org', instances.scopes.org.id));
    await click(selectors.SCOPE_CHECKBOX('org', instances.scopes.org.id));
    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.manageScopes);

    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.roleScopes);
    assert.dom(commonSelectors.TABLE_ROW).exists({ count: 0 });
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

    await click(selectors.MANAGE_DROPDOWN_ROLES);
    await click(selectors.MANAGE_DROPDOWN_ROLES_SCOPES);
    await click(commonSelectors.HREF(urls.manageCustomScopes));
    await click(selectors.SCOPE_CHECKBOX('org', instances.scopes.org.id));
    await click(commonSelectors.SAVE_BTN);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).isVisible();
  });

  test('user is prompted to confirm exit when there are unsaved changes on manage custom scopes page', async function (assert) {
    instances.role.update({ grant_scope_ids: [] });
    confirmService.enabled = true;
    await visit(urls.manageScopes);

    await click(commonSelectors.HREF(urls.manageCustomScopes));
    await click(selectors.SCOPE_CHECKBOX('org', instances.scopes.org.id));

    await click(commonSelectors.HREF(urls.roles));

    assert.dom(commonSelectors.MODAL_WARNING).isVisible();

    await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN);

    assert.strictEqual(currentURL(), urls.roles);
  });

  test('user user can cancel transition when there are unsaved changes on manage custom scopes page', async function (assert) {
    instances.role.update({ grant_scope_ids: [] });
    confirmService.enabled = true;
    await visit(urls.manageScopes);

    await click(commonSelectors.HREF(urls.manageCustomScopes));
    await click(selectors.SCOPE_CHECKBOX('org', instances.scopes.org.id));

    await click(commonSelectors.HREF(urls.roles));

    assert.dom(commonSelectors.MODAL_WARNING).isVisible();

    await click(commonSelectors.MODAL_WARNING_CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.manageCustomScopes);
  });

  test('user can choose to only deselect an org using modal on manage custom scopes page', async function (assert) {
    instances.role.update({
      grant_scope_ids: [instances.scopes.org.id, instances.scopes.project.id],
    });
    await visit(urls.manageScopes);

    await click(commonSelectors.HREF(urls.manageCustomScopes));
    await click(selectors.SCOPE_CHECKBOX('org', instances.scopes.org.id));

    assert.dom(selectors.REMOVE_ORG_MODAL('org')).isVisible();

    await click(selectors.REMOVE_ORG_ONLY_BTN('org'));
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.manageScopes);
    assert.dom(selectors.MANAGE_CUSTOM_SCOPES_BUTTON_ICON).isVisible();

    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.roleScopes);
    assert.dom(commonSelectors.TABLE_ROW).exists({ count: 1 });
  });

  test('user can choose to deselect an org and projects using modal on manage custom scopes page', async function (assert) {
    instances.role.update({
      grant_scope_ids: [instances.scopes.org.id, instances.scopes.project.id],
    });
    await visit(urls.manageScopes);

    await click(commonSelectors.HREF(urls.manageCustomScopes));
    await click(selectors.SCOPE_CHECKBOX('org', instances.scopes.org.id));

    assert.dom(selectors.REMOVE_ORG_MODAL('org')).isVisible();

    await click(selectors.REMOVE_ORG_PROJECTS_BTN('org'));
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.manageScopes);
    assert.dom(selectors.MANAGE_CUSTOM_SCOPES_BUTTON_ICON).isVisible();

    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.roleScopes);
    assert.dom(commonSelectors.TABLE_ROW).exists({ count: 0 });
  });

  test('user cannot trigger modal when deselecting an org with no projects selected on manage custom scopes page', async function (assert) {
    instances.role.update({ grant_scope_ids: [instances.scopes.org.id] });
    await visit(urls.manageScopes);

    await click(commonSelectors.HREF(urls.manageCustomScopes));
    await click(selectors.SCOPE_CHECKBOX('org', instances.scopes.org.id));

    assert.dom(selectors.REMOVE_ORG_MODAL('org')).doesNotExist();

    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.manageScopes);
    assert.dom(selectors.MANAGE_CUSTOM_SCOPES_BUTTON_ICON).isVisible();

    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.roleScopes);
    assert.dom(commonSelectors.TABLE_ROW).exists({ count: 0 });
  });

  test('user can choose to only deselect all orgs using modal on manage custom scopes page', async function (assert) {
    instances.role.update({
      grant_scope_ids: [instances.scopes.org.id, instances.scopes.project.id],
    });
    await visit(urls.manageScopes);

    await click(commonSelectors.HREF(urls.manageCustomScopes));
    // Click once to select all
    await click(selectors.TABLE_ALL_CHECKBOX);
    // Click once more to deselect all
    await click(selectors.TABLE_ALL_CHECKBOX);

    assert.dom(selectors.REMOVE_ORG_MODAL('all-orgs')).isVisible();

    await click(selectors.REMOVE_ORG_ONLY_BTN('all-orgs'));
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.manageScopes);
    assert.dom(selectors.MANAGE_CUSTOM_SCOPES_BUTTON_ICON).isVisible();

    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.roleScopes);
    assert.dom(commonSelectors.TABLE_ROW).exists({ count: 1 });
  });

  test('user can choose to deselect all orgs and projects using modal on manage custom scopes page', async function (assert) {
    instances.role.update({
      grant_scope_ids: [instances.scopes.org.id, instances.scopes.project.id],
    });
    await visit(urls.manageScopes);

    await click(commonSelectors.HREF(urls.manageCustomScopes));
    // Click once to select all
    await click(selectors.TABLE_ALL_CHECKBOX);
    // Click once more to deselect all
    await click(selectors.TABLE_ALL_CHECKBOX);

    assert.dom(selectors.REMOVE_ORG_MODAL('all-orgs')).isVisible();

    await click(selectors.REMOVE_ORG_PROJECTS_BTN('all-orgs'));
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.manageScopes);
    assert.dom(selectors.MANAGE_CUSTOM_SCOPES_BUTTON_ICON).isVisible();

    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.roleScopes);
    assert.dom(commonSelectors.TABLE_ROW).exists({ count: 0 });
  });

  test('user cannot trigger modal when deselecting all orgs with no projects selected on manage custom scopes page', async function (assert) {
    instances.role.update({ grant_scope_ids: [instances.scopes.org.id] });
    await visit(urls.manageScopes);

    await click(commonSelectors.HREF(urls.manageCustomScopes));
    // Click once to select all
    await click(selectors.TABLE_ALL_CHECKBOX);
    // Click once more to deselect all
    await click(selectors.TABLE_ALL_CHECKBOX);

    assert.dom(selectors.REMOVE_ORG_MODAL('all-orgs')).doesNotExist();

    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.manageScopes);
    assert.dom(selectors.MANAGE_CUSTOM_SCOPES_BUTTON_ICON).isVisible();

    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.roleScopes);
    assert.dom(commonSelectors.TABLE_ROW).exists({ count: 0 });
  });

  test('user can search for a specific org scope by id on manage custom scopes page', async function (assert) {
    const anotherOrg = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    await visit(urls.manageScopes);

    await click(commonSelectors.HREF(urls.manageCustomScopes));

    assert
      .dom(selectors.SCOPE_CHECKBOX('org', instances.scopes.org.id))
      .isVisible();
    assert.dom(selectors.SCOPE_CHECKBOX('org', anotherOrg.id)).isVisible();

    await fillIn(commonSelectors.SEARCH_INPUT, instances.scopes.org.id);
    await waitUntil(
      () =>
        findAll(selectors.SCOPE_CHECKBOX('org', anotherOrg.id)).length === 0,
    );

    assert
      .dom(selectors.SCOPE_CHECKBOX('org', instances.scopes.org.id))
      .isVisible();
    assert.dom(selectors.SCOPE_CHECKBOX('org', anotherOrg.id)).doesNotExist();
  });

  test('user can search for org scopes and get no results on manage custom scopes page', async function (assert) {
    const anotherOrg = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    await visit(urls.manageScopes);

    await click(commonSelectors.HREF(urls.manageCustomScopes));

    assert
      .dom(selectors.SCOPE_CHECKBOX('org', instances.scopes.org.id))
      .isVisible();
    assert.dom(selectors.SCOPE_CHECKBOX('org', anotherOrg.id)).isVisible();

    await fillIn(
      commonSelectors.SEARCH_INPUT,
      'fake scope that does not exist',
    );
    await waitUntil(
      () => findAll(selectors.NO_RESULTS_GRANT_SCOPE_MSG).length === 1,
    );

    assert
      .dom(selectors.SCOPE_CHECKBOX('org', instances.scopes.org.id))
      .doesNotExist();
    assert.dom(selectors.SCOPE_CHECKBOX('org', anotherOrg.id)).doesNotExist();
    assert
      .dom(selectors.NO_RESULTS_GRANT_SCOPE_MSG)
      .includesText('No results found');
  });

  test('user can save custom scopes to add on manage org projects page', async function (assert) {
    instances.role.update({ grant_scope_ids: [] });
    await visit(urls.role);

    await click(commonSelectors.HREF(urls.roleScopes));

    assert.dom(commonSelectors.TABLE_ROW).exists({ count: 0 });

    await click(selectors.MANAGE_DROPDOWN_ROLES);
    await click(selectors.MANAGE_DROPDOWN_ROLES_SCOPES);
    await click(commonSelectors.HREF(urls.manageCustomScopes));
    await click(
      `tbody [href="${urls.manageScopes}/${instances.scopes.org.id}"]`,
    );
    await a11yAudit();

    // Click three times to select, unselect, then reselect (for coverage)
    await click(
      selectors.SCOPE_CHECKBOX('project', instances.scopes.project.id),
    );
    await click(
      selectors.SCOPE_CHECKBOX('project', instances.scopes.project.id),
    );
    await click(
      selectors.SCOPE_CHECKBOX('project', instances.scopes.project.id),
    );
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.manageCustomScopes);

    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.manageScopes);
    assert.dom(selectors.MANAGE_CUSTOM_SCOPES_BUTTON_ICON).isVisible();

    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.roleScopes);
    assert.dom(commonSelectors.TABLE_ROW).exists({ count: 1 });
  });

  test('user can cancel custom scopes to add on manage org projects page', async function (assert) {
    instances.role.update({ grant_scope_ids: [] });
    await visit(urls.role);

    await click(commonSelectors.HREF(urls.roleScopes));

    assert.dom(commonSelectors.TABLE_ROW).exists({ count: 0 });

    await click(selectors.MANAGE_DROPDOWN_ROLES);
    await click(selectors.MANAGE_DROPDOWN_ROLES_SCOPES);
    await click(commonSelectors.HREF(urls.manageCustomScopes));
    await click(
      `tbody [href="${urls.manageScopes}/${instances.scopes.org.id}"]`,
    );

    // Click three times to select, unselect, then reselect (for coverage)
    await click(
      selectors.SCOPE_CHECKBOX('project', instances.scopes.project.id),
    );
    await click(
      selectors.SCOPE_CHECKBOX('project', instances.scopes.project.id),
    );
    await click(
      selectors.SCOPE_CHECKBOX('project', instances.scopes.project.id),
    );
    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.manageCustomScopes);

    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.manageScopes);

    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.roleScopes);
    assert.dom(commonSelectors.TABLE_ROW).exists({ count: 0 });
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

    await click(selectors.MANAGE_DROPDOWN_ROLES);
    await click(selectors.MANAGE_DROPDOWN_ROLES_SCOPES);
    await click(commonSelectors.HREF(urls.manageCustomScopes));
    await click(
      `tbody [href="${urls.manageScopes}/${instances.scopes.org.id}"]`,
    );
    await click(
      selectors.SCOPE_CHECKBOX('project', instances.scopes.project.id),
    );
    await click(commonSelectors.SAVE_BTN);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).isVisible();
  });

  test('user is prompted to confirm exit when there are unsaved changes on manage org projects page', async function (assert) {
    instances.role.update({ grant_scope_ids: [] });
    confirmService.enabled = true;
    await visit(urls.manageScopes);

    await click(commonSelectors.HREF(urls.manageCustomScopes));
    await click(
      `tbody [href="${urls.manageScopes}/${instances.scopes.org.id}"]`,
    );
    await click(
      selectors.SCOPE_CHECKBOX('project', instances.scopes.project.id),
    );
    await click(commonSelectors.HREF(urls.roles));

    assert.dom(commonSelectors.MODAL_WARNING).isVisible();

    await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN);

    assert.strictEqual(currentURL(), urls.roles);
  });

  test('user user can cancel transition when there are unsaved changes on manage org projects page', async function (assert) {
    instances.role.update({ grant_scope_ids: [] });
    confirmService.enabled = true;
    await visit(urls.manageScopes);

    await click(commonSelectors.HREF(urls.manageCustomScopes));
    await click(
      `tbody [href="${urls.manageScopes}/${instances.scopes.org.id}"]`,
    );
    await click(
      selectors.SCOPE_CHECKBOX('project', instances.scopes.project.id),
    );
    await click(commonSelectors.HREF(urls.roles));

    assert.dom(commonSelectors.MODAL_WARNING).isVisible();

    await click(commonSelectors.MODAL_WARNING_CANCEL_BTN);

    assert.strictEqual(
      currentURL(),
      `${urls.manageScopes}/${instances.scopes.org.id}`,
    );
  });

  test('user can search for a specific project scope by id on manage org projects page', async function (assert) {
    const anotherProject = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    await visit(urls.role);

    await click(selectors.MANAGE_DROPDOWN_ROLES);
    await click(selectors.MANAGE_DROPDOWN_ROLES_SCOPES);
    await click(commonSelectors.HREF(urls.manageCustomScopes));
    await click(
      `tbody [href="${urls.manageScopes}/${instances.scopes.org.id}"]`,
    );

    assert
      .dom(selectors.SCOPE_CHECKBOX('project', instances.scopes.project.id))
      .isVisible();
    assert
      .dom(selectors.SCOPE_CHECKBOX('project', anotherProject.id))
      .isVisible();

    await fillIn(commonSelectors.SEARCH_INPUT, instances.scopes.project.id);
    await waitUntil(
      () =>
        findAll(selectors.SCOPE_CHECKBOX('project', anotherProject.id))
          .length === 0,
    );

    assert
      .dom(selectors.SCOPE_CHECKBOX('project', instances.scopes.project.id))
      .isVisible();
    assert
      .dom(selectors.SCOPE_CHECKBOX('project', anotherProject.id))
      .doesNotExist();
  });

  test('user can search for project scopes and get no results on manage org projects page', async function (assert) {
    const anotherProject = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    await visit(urls.role);

    await click(selectors.MANAGE_DROPDOWN_ROLES);
    await click(selectors.MANAGE_DROPDOWN_ROLES_SCOPES);
    await click(commonSelectors.HREF(urls.manageCustomScopes));
    await click(
      `tbody [href="${urls.manageScopes}/${instances.scopes.org.id}"]`,
    );

    assert
      .dom(selectors.SCOPE_CHECKBOX('project', instances.scopes.project.id))
      .isVisible();
    assert
      .dom(selectors.SCOPE_CHECKBOX('project', anotherProject.id))
      .isVisible();

    await fillIn(
      commonSelectors.SEARCH_INPUT,
      'fake scope that does not exist',
    );
    await waitUntil(
      () => findAll(selectors.NO_RESULTS_GRANT_SCOPE_MSG).length === 1,
    );

    assert
      .dom(selectors.SCOPE_CHECKBOX('project', instances.scopes.project.id))
      .doesNotExist();
    assert
      .dom(selectors.SCOPE_CHECKBOX('project', anotherProject.id))
      .doesNotExist();
    assert
      .dom(selectors.NO_RESULTS_GRANT_SCOPE_MSG)
      .includesText('No results found');
  });
});
