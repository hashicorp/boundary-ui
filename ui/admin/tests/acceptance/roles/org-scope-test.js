/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import {
  click,
  currentURL,
  fillIn,
  findAll,
  visit,
  waitUntil,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import * as selectors from './selectors';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import {
  GRANT_SCOPE_CHILDREN,
  GRANT_SCOPE_DESCENDANTS,
  GRANT_SCOPE_THIS,
} from 'api/models/role';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | roles | org-scope', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  let confirmService;

  const instances = {
    scopes: {
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
    manageOrgProjects: null,
  };

  hooks.beforeEach(async function () {
    confirmService = this.owner.lookup('service:confirm');

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

    await click(commonSelectors.HREF(urls.roleScopes));

    assert.strictEqual(currentURL(), urls.roleScopes);
    assert
      .dom(commonSelectors.TABLE_ROWS)
      .exists({ count: instances.role.grant_scope_ids.length });
  });

  test('user can navigate to scope from role grant scopes', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const scopeUrl = `/scopes/${instances.role.grant_scope_ids[1]}`;
    await visit(urls.role);

    await click(commonSelectors.HREF(urls.roleScopes));
    await click(commonSelectors.TABLE_RESOURCE_LINK(scopeUrl));

    assert.strictEqual(currentURL(), `${scopeUrl}/targets`);
  });

  test('user can navigate to parent scope from role grant scopes', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.role);

    await click(commonSelectors.HREF(urls.roleScopes));
    await click(selectors.GRANT_SCOPE_PARENT_SCOPE);

    assert.strictEqual(
      currentURL(),
      `/scopes/${instances.scopes.org.id}/scopes`,
    );
  });

  test('user can search for existing grant scope on a role', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

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
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

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

  test('user cannot filter grant scopes on an org level role', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.role);

    await click(commonSelectors.HREF(urls.roleScopes));

    assert.dom(commonSelectors.FILTER_DROPDOWN('parent-scope')).doesNotExist();
    assert.dom(commonSelectors.FILTER_DROPDOWN('type')).doesNotExist();
  });

  test('user sees no scopes message and action when role has no grant scopes', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

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

  test('correct toggles are visible for org level role on manage scopes page', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.role);

    await click(selectors.MANAGE_DROPDOWN_ROLES);
    await click(selectors.MANAGE_DROPDOWN_ROLES_SCOPES);

    assert.strictEqual(currentURL(), urls.manageScopes);
    assert.dom(selectors.SCOPE_TOGGLE(GRANT_SCOPE_THIS)).isVisible();
    assert.dom(selectors.SCOPE_TOGGLE(GRANT_SCOPE_CHILDREN)).isVisible();
    assert.dom(selectors.SCOPE_TOGGLE(GRANT_SCOPE_DESCENDANTS)).doesNotExist();
  });

  test('manage custom scopes button is not visible when "children" is toggled on for org level role on manage scopes page', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.role);

    await click(selectors.MANAGE_DROPDOWN_ROLES);
    await click(selectors.MANAGE_DROPDOWN_ROLES_SCOPES);

    assert.strictEqual(currentURL(), urls.manageScopes);
    assert.dom(selectors.MANAGE_CUSTOM_SCOPES_BUTTON).isVisible();

    await click(selectors.SCOPE_TOGGLE(GRANT_SCOPE_CHILDREN));

    assert.dom(selectors.MANAGE_CUSTOM_SCOPES_BUTTON).doesNotExist();
  });

  test('user can save scope keywords to add on manage scopes page', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.role.update({ grant_scope_ids: [] });
    await visit(urls.role);

    await click(commonSelectors.HREF(urls.roleScopes));

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: 0 });

    await click(selectors.MANAGE_DROPDOWN_ROLES);
    await click(selectors.MANAGE_DROPDOWN_ROLES_SCOPES);

    assert.strictEqual(currentURL(), urls.manageScopes);

    // Click three times to select, unselect, then reselect (for coverage)
    await click(selectors.SCOPE_TOGGLE(GRANT_SCOPE_THIS));
    await click(selectors.SCOPE_TOGGLE(GRANT_SCOPE_THIS));
    await click(selectors.SCOPE_TOGGLE(GRANT_SCOPE_THIS));
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.roleScopes);
    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: 1 });
  });

  test('user can cancel scope keywords to add on manage scopes page', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.role.update({ grant_scope_ids: [] });
    await visit(urls.role);

    await click(commonSelectors.HREF(urls.roleScopes));

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: 0 });

    await click(selectors.MANAGE_DROPDOWN_ROLES);
    await click(selectors.MANAGE_DROPDOWN_ROLES_SCOPES);

    assert.strictEqual(currentURL(), urls.manageScopes);

    // Click three times to select, unselect, then reselect (for coverage)
    await click(selectors.SCOPE_TOGGLE(GRANT_SCOPE_THIS));
    await click(selectors.SCOPE_TOGGLE(GRANT_SCOPE_THIS));
    await click(selectors.SCOPE_TOGGLE(GRANT_SCOPE_THIS));
    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.roleScopes);
    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: 0 });
  });

  test('shows error message on scope save on manage scopes page', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

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
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

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
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

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

  test('user can save custom scopes to add on manage org projects page', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.role.update({ grant_scope_ids: [] });
    await visit(urls.role);

    await click(commonSelectors.HREF(urls.roleScopes));

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: 0 });

    await click(selectors.MANAGE_DROPDOWN_ROLES);
    await click(selectors.MANAGE_DROPDOWN_ROLES_SCOPES);
    await click(commonSelectors.HREF(urls.manageOrgProjects));

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

    assert.strictEqual(currentURL(), urls.manageScopes);
    assert.dom(selectors.MANAGE_CUSTOM_SCOPES_BUTTON_ICON).isVisible();

    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.roleScopes);
    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: 1 });
  });

  test('user can cancel custom scopes to add on manage org projects page', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.role.update({ grant_scope_ids: [] });
    await visit(urls.role);

    await click(commonSelectors.HREF(urls.roleScopes));

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: 0 });

    await click(selectors.MANAGE_DROPDOWN_ROLES);
    await click(selectors.MANAGE_DROPDOWN_ROLES_SCOPES);
    await click(commonSelectors.HREF(urls.manageOrgProjects));

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

    assert.strictEqual(currentURL(), urls.manageScopes);

    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.roleScopes);
    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: 0 });
  });

  test('shows error message on custom scope save on manage org projects page', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

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
    await click(commonSelectors.HREF(urls.manageOrgProjects));
    await click(
      selectors.SCOPE_CHECKBOX('project', instances.scopes.project.id),
    );
    await click(commonSelectors.SAVE_BTN);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).isVisible();
  });

  test('user is prompted to confirm exit when there are unsaved changes on manage org projects page', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.role.update({ grant_scope_ids: [] });
    confirmService.enabled = true;
    await visit(urls.manageScopes);

    await click(commonSelectors.HREF(urls.manageOrgProjects));
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

    await click(commonSelectors.HREF(urls.manageOrgProjects));
    await click(
      selectors.SCOPE_CHECKBOX('project', instances.scopes.project.id),
    );
    await click(commonSelectors.HREF(urls.roles));

    assert.dom(commonSelectors.MODAL_WARNING).isVisible();

    await click(commonSelectors.MODAL_WARNING_CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.manageOrgProjects);
  });

  test('user can search for a specific project scope by id on manage org projects page', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const anotherProject = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    await visit(urls.role);

    await click(selectors.MANAGE_DROPDOWN_ROLES);
    await click(selectors.MANAGE_DROPDOWN_ROLES_SCOPES);
    await click(commonSelectors.HREF(urls.manageOrgProjects));

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
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const anotherProject = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    await visit(urls.role);

    await click(selectors.MANAGE_DROPDOWN_ROLES);
    await click(selectors.MANAGE_DROPDOWN_ROLES_SCOPES);
    await click(commonSelectors.HREF(urls.manageOrgProjects));

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
