/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | users | update', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  const urls = {
    orgScope: null,
    users: null,
    user: null,
  };

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    user: null,
  };

  hooks.beforeEach(async function () {
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

    await authenticateSession({});
  });

  test('can save changes to an existing user', async function (assert) {
    await visit(urls.users);

    await click(`[href="${urls.user}"]`);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'Updated user name');
    await click('.rose-form-actions [type="submit"]');

    assert.strictEqual(currentURL(), urls.user);
    assert.strictEqual(
      this.server.schema.users.first().name,
      'Updated user name',
    );
  });

  test('cannot make changes to an existing user without proper authorization', async function (assert) {
    instances.user.authorized_actions =
      instances.user.authorized_actions.filter((item) => item !== 'update');
    await visit(urls.users);

    await click(`[href="${urls.user}"]`);

    assert.false(instances.user.authorized_actions.includes('update'));
    assert.dom('form [type="button"]').doesNotExist();
  });

  test('can cancel changes to an existing user', async function (assert) {
    await visit(urls.users);

    await click(`[href="${urls.user}"]`);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'Unsaved user name');
    await click('.rose-form-actions [type="button"]');

    assert.notEqual(instances.user.name, 'Unsaved user name');
    assert.dom('[name="name"]').hasValue(instances.user.name);
  });

  test('saving an existing user with invalid fields displays error messages', async function (assert) {
    await visit(urls.users);
    this.server.patch('/users/:id', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {
            request_fields: [
              {
                name: 'name',
                description: 'Name is required.',
              },
            ],
          },
        },
      );
    });

    await click(`[href="${urls.user}"]`);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'User name');
    await click('[type="submit"]');

    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid.');
    assert.dom('[data-test-error-message-name]').hasText('Name is required.');
  });

  test('can discard unsaved user changes via dialog', async function (assert) {
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.user.name, 'Unsaved user name');
    await visit(urls.user);

    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'Unsaved user name');
    assert.strictEqual(currentURL(), urls.user);
    await click(`[href="${urls.users}"]`);
    assert.dom(commonSelectors.MODAL_WARNING).exists();
    await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN, 'Click Discard');

    assert.strictEqual(currentURL(), urls.users);
    assert.notEqual(this.server.schema.users.first().name, 'Unsaved user name');
  });

  test('can click cancel on discard dialog box for unsaved user changes', async function (assert) {
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.user.name, 'Unsaved user name');
    await visit(urls.user);

    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'Unsaved user name');
    assert.strictEqual(currentURL(), urls.user);
    await click(`[href="${urls.users}"]`);
    assert.dom(commonSelectors.MODAL_WARNING).exists();
    await click(commonSelectors.MODAL_WARNING_CANCEL_BTN, 'Click Cancel');

    assert.strictEqual(currentURL(), urls.user);
    assert.notEqual(this.server.schema.users.first().name, 'Unsaved user name');
  });
});
