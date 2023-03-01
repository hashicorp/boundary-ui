/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | users | read', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

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

  test('visiting users', async function (assert) {
    assert.expect(1);
    await visit(urls.orgScope);
    await a11yAudit();

    await click(`[href="${urls.users}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.users);
  });

  test('visiting user', async function (assert) {
    assert.expect(1);
    await visit(urls.users);

    await click(`[href="${urls.user}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.user);
  });

  test('cannot navigate to an account form without proper authorization', async function (assert) {
    assert.expect(1);
    instances.user.authorized_actions =
      instances.user.authorized_actions.filter((item) => item !== 'read');
    await visit(urls.orgScope);

    await click(`[href="${urls.users}"]`);

    assert.dom(`.rose-table [href="${urls.user}"]`).doesNotExist();
  });

  test('users can link to docs page for users', async function (assert) {
    assert.expect(1);
    await visit(urls.orgScope);

    await click(`[href="${urls.users}"]`);

    assert
      .dom(`[href="https://boundaryproject.io/help/admin-ui/users"]`)
      .exists();
  });
});
