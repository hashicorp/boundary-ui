/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as selectors from './selectors';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | roles | principals', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupSqlite(hooks);
  setupIndexedDb(hooks);

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
    newRole: null,
  };
  let principalsCount;

  hooks.beforeEach(async function () {
    await authenticateSession({ username: 'admin' });
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
      'withPrincipals',
    );

    principalsCount =
      this.server.schema.roles.first().userIds.length +
      this.server.schema.roles.first().groupIds.length +
      this.server.schema.roles.first().managedGroupIds.length;
    urls.roles = `/scopes/${instances.scopes.org.id}/roles`;
    urls.role = `${urls.roles}/${instances.role.id}`;
    urls.rolePrincipals = `${urls.role}/principals`;
    urls.addPrincipals = `${urls.role}/add-principals`;
  });

  test('visiting role principals', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.rolePrincipals);

    assert.strictEqual(currentURL(), urls.rolePrincipals);
    assert.strictEqual(findAll('tbody tr').length, principalsCount);
  });

  test('principal can be removed from a role', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.rolePrincipals);

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: principalsCount });

    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN);
    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN_ITEM_BTN);

    assert
      .dom(commonSelectors.TABLE_ROWS)
      .exists({ count: principalsCount - 1 });
  });

  test('principal cannot be removed from a role without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const authorized_actions = instances.role.authorized_actions.filter(
      (item) => item !== 'remove-principals',
    );
    instances.role.update({ authorized_actions });

    await visit(urls.rolePrincipals);

    assert.dom(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN).doesNotExist();
  });

  test('shows error message on principal remove', async function (assert) {
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
    await visit(urls.rolePrincipals);

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: principalsCount });

    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN);
    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN_ITEM_BTN);

    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid.');
  });

  test('cannot navigate to add principals without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const authorized_actions = instances.role.authorized_actions.filter(
      (item) => item !== 'add-principals',
    );
    instances.role.update({ authorized_actions });

    await visit(urls.rolePrincipals);
    await click(selectors.MANAGE_DROPDOWN_ROLES);

    assert.dom(selectors.MANAGE_DROPDOWN_ADD_PRINCIPALS).doesNotExist();
  });

  test('select and save principals to add', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.role.update({ userIds: [], groupIds: [], managedGroupIds: [] });
    await visit(urls.rolePrincipals);

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: 0 });

    await click(selectors.MANAGE_DROPDOWN_ROLES);
    await click(selectors.MANAGE_DROPDOWN_ADD_PRINCIPALS);

    assert.strictEqual(currentURL(), urls.addPrincipals);

    // Click three times to select, unselect, then reselect (for coverage)
    await click(commonSelectors.TABLE_ROW_CHECKBOX);
    await click(commonSelectors.TABLE_ROW_CHECKBOX);
    await click(commonSelectors.TABLE_ROW_CHECKBOX);
    await click(commonSelectors.SAVE_BTN);
    await visit(urls.rolePrincipals);

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: 1 });
  });

  test('select and cancel principals to add', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.rolePrincipals);

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: principalsCount });

    // Remove a principal to populate association view
    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN);
    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN_ITEM_BTN);

    assert
      .dom(commonSelectors.TABLE_ROWS)
      .exists({ count: principalsCount - 1 });

    await click(selectors.MANAGE_DROPDOWN_ROLES);
    await click(selectors.MANAGE_DROPDOWN_ADD_PRINCIPALS);

    assert.strictEqual(currentURL(), urls.addPrincipals);

    await click(commonSelectors.TABLE_ROW_CHECKBOX);
    await click(commonSelectors.CANCEL_BTN);
    await visit(urls.rolePrincipals);

    assert
      .dom(commonSelectors.TABLE_ROWS)
      .exists({ count: principalsCount - 1 });
  });

  test('shows error message on principal add', async function (assert) {
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
    instances.role.update({ userIds: [], groupIds: [], managedGroupIds: [] });
    await visit(urls.addPrincipals);

    await click(commonSelectors.TABLE_ROW_CHECKBOX);
    await click(commonSelectors.SAVE_BTN);

    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid.');
  });
});
