/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { Response } from 'miragejs';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | users | delete', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  let getUsersCount, confirmService;

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

  hooks.beforeEach(async function () {
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
    getUsersCount = () => this.server.schema.users.all().models.length;
    confirmService = this.owner.lookup('service:confirm');
  });

  test('can delete a user', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const usersCount = getUsersCount();
    await visit(urls.users);

    await click(commonSelectors.HREF(urls.user));

    await click(selectors.MANAGE_DROPDOWN_USER);
    await click(selectors.MANAGE_DROPDOWN_USER_DELETE);

    assert.strictEqual(getUsersCount(), usersCount - 1);
  });

  test('cannot delete a user without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.user.authorized_actions =
      instances.user.authorized_actions.filter((item) => item !== 'delete');
    await visit(urls.users);

    await click(commonSelectors.HREF(urls.user));

    await click(selectors.MANAGE_DROPDOWN_USER);
    assert.dom(selectors.MANAGE_DROPDOWN_USER_DELETE).doesNotExist();
  });

  test('can accept delete user via dialog', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const usersCount = getUsersCount();
    confirmService.enabled = true;
    await visit(urls.users);

    await click(commonSelectors.HREF(urls.user));
    await click(selectors.MANAGE_DROPDOWN_USER);
    await click(selectors.MANAGE_DROPDOWN_USER_DELETE);
    await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN);

    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('Deleted successfully.');
    assert.strictEqual(getUsersCount(), usersCount - 1);
    assert.strictEqual(currentURL(), urls.users);
  });

  test('can cancel delete user via dialog', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const usersCount = getUsersCount();
    confirmService.enabled = true;
    await visit(urls.users);

    await click(commonSelectors.HREF(urls.user));
    await click(selectors.MANAGE_DROPDOWN_USER);
    await click(selectors.MANAGE_DROPDOWN_USER_DELETE);
    await click(commonSelectors.MODAL_WARNING_CANCEL_BTN);

    assert.strictEqual(getUsersCount(), usersCount);
    assert.strictEqual(currentURL(), urls.user);
  });

  test('errors are displayed when user deletion fails', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

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

    await click(commonSelectors.HREF(urls.user));
    await click(selectors.MANAGE_DROPDOWN_USER);
    await click(selectors.MANAGE_DROPDOWN_USER_DELETE);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText('Oops.');
  });
});
