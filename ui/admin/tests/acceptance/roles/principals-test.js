/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, find, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | roles | principals', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  const MANAGE_DROPDOWN_SELECTOR = '.hds-dropdown-toggle-button';
  const ADD_PRINCIPALS_SELECTOR = '[data-test-manage-dropdown-principals]';

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
      this.server.db.roles[0].userIds.length +
      this.server.db.roles[0].groupIds.length +
      this.server.db.roles[0].managedGroupIds.length;
    urls.roles = `/scopes/${instances.scopes.org.id}/roles`;
    urls.role = `${urls.roles}/${instances.role.id}`;
    urls.rolePrincipals = `${urls.role}/principals`;
    urls.addPrincipals = `${urls.role}/add-principals`;
  });

  test('visiting role principals', async function (assert) {
    await visit(urls.rolePrincipals);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.rolePrincipals);
    assert.strictEqual(findAll('tbody tr').length, principalsCount);
  });

  test('principal can be removed from a role', async function (assert) {
    await visit(urls.rolePrincipals);
    assert.strictEqual(findAll('tbody tr').length, principalsCount);
    await click('.hds-dropdown-toggle-icon');
    await click('tbody tr .hds-dropdown-list-item button');
    assert.strictEqual(findAll('tbody tr').length, principalsCount - 1);
  });

  test('principal cannot be removed from a role without proper authorization', async function (assert) {
    const authorized_actions = instances.role.authorized_actions.filter(
      (item) => item !== 'remove-principals',
    );
    instances.role.update({ authorized_actions });
    await visit(urls.rolePrincipals);
    assert.notOk(find('tbody tr .hds-dropdown-list-item button'));
  });

  test('shows error message on principal remove', async function (assert) {
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
    assert.strictEqual(findAll('tbody tr').length, principalsCount);
    await click('.hds-dropdown-toggle-icon');
    await click('tbody tr .hds-dropdown-list-item button');
    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid.');
  });

  test('cannot navigate to add principals without proper authorization', async function (assert) {
    const authorized_actions = instances.role.authorized_actions.filter(
      (item) => item !== 'add-principals',
    );
    instances.role.update({ authorized_actions });
    await visit(urls.rolePrincipals);
    assert.dom(ADD_PRINCIPALS_SELECTOR).doesNotExist();
  });

  test('select and save principals to add', async function (assert) {
    instances.role.update({ userIds: [], groupIds: [], managedGroupIds: [] });
    await visit(urls.rolePrincipals);
    assert.strictEqual(findAll('tbody tr').length, 0);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(ADD_PRINCIPALS_SELECTOR);
    assert.strictEqual(currentURL(), urls.addPrincipals);
    // Click three times to select, unselect, then reselect (for coverage)
    await click('tbody label');
    await click('tbody label');
    await click('tbody label');
    await click('form [type="submit"]');
    await visit(urls.rolePrincipals);
    assert.strictEqual(findAll('tbody tr').length, 1);
  });

  test('select and cancel principals to add', async function (assert) {
    await visit(urls.rolePrincipals);
    assert.strictEqual(findAll('tbody tr').length, principalsCount);
    // Remove a principal to populate association view
    await click('.hds-dropdown-toggle-icon');
    await click('tbody tr .hds-dropdown-list-item button');
    assert.strictEqual(findAll('tbody tr').length, principalsCount - 1);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(ADD_PRINCIPALS_SELECTOR);
    assert.strictEqual(currentURL(), urls.addPrincipals);
    await click('tbody label');
    await click('form [type="button"]');
    await visit(urls.rolePrincipals);
    assert.strictEqual(findAll('tbody tr').length, principalsCount - 1);
  });

  test('shows error message on principal add', async function (assert) {
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
    await click('tbody label');
    await click('form [type="submit"]');
    assert.ok(find(commonSelectors.ALERT_TOAST_BODY));
  });
});
