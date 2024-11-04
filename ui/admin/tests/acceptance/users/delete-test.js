/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | users | delete', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);
  const DELETE_ACTION_SELECTOR =
    '[data-test-manage-user-dropdown] ul li button';
  const MANAGE_DROPDOWN_SELECTOR =
    '[data-test-manage-user-dropdown] button:first-child';
  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    user: null,
  };

  const urls = {
    orgScope: null,
    users: null,
    user: null,
  };

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.user = this.server.create('user', {
      scope: instances.scopes.org,
    });
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.users = `${urls.orgScope}/users`;
    urls.user = `${urls.users}/${instances.user.id}`;

    authenticateSession({});
  });

  test('can delete a user', async function (assert) {
    const usersCount = this.server.db.users.length;
    await visit(urls.users);

    await click(`[href="${urls.user}"]`);

    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(DELETE_ACTION_SELECTOR);

    assert.strictEqual(this.server.db.users.length, usersCount - 1);
  });

  test('cannot delete a user without proper authorization', async function (assert) {
    instances.user.authorized_actions =
      instances.user.authorized_actions.filter((item) => item !== 'delete');
    await visit(urls.users);

    await click(`[href="${urls.user}"]`);

    await click(MANAGE_DROPDOWN_SELECTOR);
    assert.dom('[data-test-manage-user-dropdown] ul li button').doesNotExist();
  });

  test('can accept delete user via dialog', async function (assert) {
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    const usersCount = this.server.db.users.length;
    await visit(urls.users);

    await click(`[href="${urls.user}"]`);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(DELETE_ACTION_SELECTOR);
    await click('.rose-dialog .rose-button-primary');

    assert.dom('.rose-notification-body').hasText('Deleted successfully.');
    assert.strictEqual(this.server.db.users.length, usersCount - 1);
    assert.strictEqual(currentURL(), urls.users);
  });

  test('can cancel delete user via dialog', async function (assert) {
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    const usersCount = this.server.db.users.length;
    await visit(urls.users);

    await click(`[href="${urls.user}"]`);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(DELETE_ACTION_SELECTOR);
    await click('.rose-dialog .rose-button-secondary');

    assert.strictEqual(this.server.db.users.length, usersCount);
    assert.strictEqual(currentURL(), urls.user);
  });

  test('errors are displayed when user deletion fails', async function (assert) {
    await visit(urls.users);
    this.server.del('/users/:id', () => {
      return new Response(
        490,
        {},
        {
          status: 490,
          code: 'error',
          message: 'Oops.',
        },
      );
    });

    await click(`[href="${urls.user}"]`);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(DELETE_ACTION_SELECTOR);
    assert.dom('.rose-notification-body').hasText('Oops.');
  });
});
