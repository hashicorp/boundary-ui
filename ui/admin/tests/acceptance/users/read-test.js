/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | users | read', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);
  setupSqlite(hooks);

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
    await authenticateSession({ username: 'admin' });
  });

  test('visiting users', async function (assert) {
    await visit(urls.orgScope);
    await a11yAudit();

    await click(commonSelectors.HREF(urls.users));
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.users);
  });

  test('visiting user', async function (assert) {
    await visit(urls.users);

    await click(commonSelectors.HREF(urls.user));
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.user);
  });

  test('cannot navigate to an account form without proper authorization', async function (assert) {
    instances.user.authorized_actions =
      instances.user.authorized_actions.filter((item) => item !== 'read');
    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.users));

    assert.dom(commonSelectors.TABLE_RESOURCE_LINK(urls.user)).doesNotExist();
  });

  test('users can link to docs page for users', async function (assert) {
    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.users));

    assert
      .dom(
        `[href="https://developer.hashicorp.com/boundary/docs/concepts/domain-model/users"]`,
      )
      .exists();
  });

  test('users can navigate to user and incorrect url auto-corrects', async function (assert) {
    const incorrectUrl = `/scopes/global/users/${instances.user.id}`;

    await visit(incorrectUrl);

    assert.notEqual(currentURL(), incorrectUrl);
    assert.strictEqual(currentURL(), urls.user);
  });
});
