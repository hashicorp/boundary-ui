/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | users | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    user: null,
  };

  const urls = {
    globalScope: null,
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
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.users = `${urls.orgScope}/users`;
    urls.user = `${urls.users}/${instances.user.id}`;
    authenticateSession({});
  });

  test('users can navigate to users with proper authorization', async function (assert) {
    assert.expect(3);
    await visit(urls.globalScope);

    await click(`[href="${urls.orgScope}"]`);

    assert.true(
      instances.scopes.org.authorized_collection_actions.users.includes('list')
    );
    assert.true(
      instances.scopes.org.authorized_collection_actions.users.includes(
        'create'
      )
    );

    assert.dom(`[href="${urls.users}"]`).exists();
  });

  test('user cannot navigate to users tab without either list or create actions', async function (assert) {
    assert.expect(3);
    instances.scopes.org.authorized_collection_actions.users = [];
    await visit(urls.globalScope);

    await click(`[href="${urls.orgScope}"]`);

    assert.false(
      instances.scopes.org.authorized_collection_actions.users.includes(
        'create'
      )
    );
    assert.false(
      instances.scopes.org.authorized_collection_actions.users.includes('list')
    );
    assert.dom(`nav [href="${urls.users}"]`).doesNotExist();
  });

  test('user can navigate to users tab with only create action', async function (assert) {
    assert.expect(4);
    instances.scopes.org.authorized_collection_actions.users =
      instances.scopes.org.authorized_collection_actions.users.filter(
        (item) => item !== 'list'
      );
    await visit(urls.globalScope);

    await click(`[href="${urls.orgScope}"]`);

    assert.false(
      instances.scopes.org.authorized_collection_actions.users.includes('list')
    );
    assert.true(
      instances.scopes.org.authorized_collection_actions.users.includes(
        'create'
      )
    );
    assert.dom(`[href="${urls.users}"]`).exists();

    await click(`[href="${urls.users}"]`);

    assert.dom(`.rose-table [href="${urls.user}"]`).doesNotExist();
  });

  test('user can navigate to users tab with only list action', async function (assert) {
    assert.expect(4);
    instances.scopes.org.authorized_collection_actions.users =
      instances.scopes.org.authorized_collection_actions.users.filter(
        (item) => item !== 'create'
      );
    await visit(urls.globalScope);

    await click(`[href="${urls.orgScope}"]`);

    assert.true(
      instances.scopes.org.authorized_collection_actions.users.includes('list')
    );
    assert.false(
      instances.scopes.org.authorized_collection_actions.users.includes(
        'create'
      )
    );
    assert.dom(`[href="${urls.users}"]`).exists();

    await click(`[href="${urls.users}"]`);

    assert.dom(`[href="${urls.user}"]`).exists();
  });
});
