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

module('Acceptance | users | create', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  let getUsersCount;

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
    newUser: null,
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
    urls.newUser = `${urls.users}/new`;
    getUsersCount = () => {
      return this.server.schema.users.all().models.length;
    };
    await authenticateSession({});
  });

  test('can create new users', async function (assert) {
    const usersCount = getUsersCount();
    await visit(urls.users);

    await click(`[href="${urls.newUser}"]`);
    await fillIn('[name="name"]', 'User name');
    await click('[type="submit"]');

    assert.strictEqual(getUsersCount(), usersCount + 1);
  });

  test('users can navigate to new users route with proper authorization', async function (assert) {
    await visit(urls.orgScope);

    await click(`[href="${urls.users}"]`);

    assert.true(
      instances.scopes.org.authorized_collection_actions.users.includes(
        'create',
      ),
    );
    assert.dom(`[href="${urls.newUser}"]`).exists();
  });

  test('users cannot navigate to new users route without proper authorization', async function (assert) {
    instances.scopes.org.authorized_collection_actions.users =
      instances.scopes.org.authorized_collection_actions.users.filter(
        (item) => item !== 'create',
      );
    await visit(urls.orgScope);

    await click(`[href="${urls.users}"]`);

    assert.false(
      instances.scopes.org.authorized_collection_actions.users.includes(
        'create',
      ),
    );

    assert.dom('.rose-button-primary').doesNotExist();
  });

  test('can cancel creation of a new user', async function (assert) {
    const usersCount = getUsersCount();
    await visit(urls.users);

    await click(`[href="${urls.newUser}"]`);
    await fillIn('[name="name"]', 'User name');
    await click('.rose-form-actions [type="button"]');

    assert.strictEqual(currentURL(), urls.users);
    assert.strictEqual(getUsersCount(), usersCount);
  });

  test('saving a new user with invalid fields displays error messages', async function (assert) {
    const usersCount = getUsersCount();
    await visit(urls.users);
    this.server.post('/users', () => {
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

    await click(`[href="${urls.newUser}"]`);
    await fillIn('[name="description"]', 'test');
    await click('[type="submit"]');

    assert.strictEqual(getUsersCount(), usersCount);
    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid.');
    assert.dom('[data-test-error-message-name]').hasText('Name is required.');
  });

  test('users cannot directly navigate to new user route without proper authorization', async function (assert) {
    instances.scopes.org.authorized_collection_actions.users =
      instances.scopes.org.authorized_collection_actions.users.filter(
        (item) => item !== 'create',
      );

    await visit(urls.newUser);

    assert.false(
      instances.scopes.org.authorized_collection_actions.users.includes(
        'create',
      ),
    );
    assert.strictEqual(currentURL(), urls.users);
  });
});
