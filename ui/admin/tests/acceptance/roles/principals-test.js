/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, find, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | roles | principals', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

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
      'withPrincipals'
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
    assert.expect(2);
    await visit(urls.rolePrincipals);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.rolePrincipals);
    assert.strictEqual(findAll('tbody tr').length, principalsCount);
  });

  test('principal can be removed from a role', async function (assert) {
    assert.expect(2);
    await visit(urls.rolePrincipals);
    assert.strictEqual(findAll('tbody tr').length, principalsCount);
    await click('tbody tr .rose-dropdown-button-danger');
    assert.strictEqual(findAll('tbody tr').length, principalsCount - 1);
  });

  test('principal cannot be removed from a role without proper authorization', async function (assert) {
    assert.expect(1);
    const authorized_actions = instances.role.authorized_actions.filter(
      (item) => item !== 'remove-principals'
    );
    instances.role.update({ authorized_actions });
    await visit(urls.rolePrincipals);
    assert.notOk(find('tbody tr .rose-dropdown-button-danger'));
  });

  test('shows error message on principal remove', async function (assert) {
    assert.expect(2);
    this.server.post('/roles/:idMethod', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {},
        }
      );
    });
    await visit(urls.rolePrincipals);
    assert.strictEqual(findAll('tbody tr').length, principalsCount);
    await click('tbody tr .rose-dropdown-button-danger');
    assert.ok(find('[role="alert"]'));
  });

  test('cannot navigate to add principals without proper authorization', async function (assert) {
    assert.expect(1);
    const authorized_actions = instances.role.authorized_actions.filter(
      (item) => item !== 'add-principals'
    );
    instances.role.update({ authorized_actions });
    await visit(urls.rolePrincipals);
    assert.notOk(find('.rose-layout-page-actions a'));
  });

  test('select and save principals to add', async function (assert) {
    assert.expect(3);
    instances.role.update({ userIds: [], groupIds: [], managedGroupIds: [] });
    await visit(urls.rolePrincipals);
    assert.strictEqual(findAll('tbody tr').length, 0);
    await click('.rose-layout-page-actions a');
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
    assert.expect(4);
    await visit(urls.rolePrincipals);
    assert.strictEqual(findAll('tbody tr').length, principalsCount);
    // Remove a principal to populate association view
    await click('tbody tr .rose-dropdown-button-danger');
    assert.strictEqual(findAll('tbody tr').length, principalsCount - 1);
    await click('.rose-layout-page-actions a');
    assert.strictEqual(currentURL(), urls.addPrincipals);
    await click('tbody label');
    await click('form [type="button"]');
    await visit(urls.rolePrincipals);
    assert.strictEqual(findAll('tbody tr').length, principalsCount - 1);
  });

  test('shows error message on principal add', async function (assert) {
    assert.expect(1);
    this.server.post('/roles/:idMethod', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {},
        }
      );
    });
    instances.role.update({ userIds: [], groupIds: [], managedGroupIds: [] });
    await visit(urls.addPrincipals);
    await click('tbody label');
    await click('form [type="submit"]');
    assert.ok(find('[role="alert"]'));
  });
});
