/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | roles | scopes', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
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
    roleScopes: null,
  };

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
      'withScopes',
    );
    urls.roles = `/scopes/${instances.scopes.org.id}/roles`;
    urls.role = `${urls.roles}/${instances.role.id}`;
    urls.roleScopes = `${urls.role}/scopes`;
  });

  test('visiting role scopes', async function (assert) {
    await visit(urls.roleScopes);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.roleScopes);
    assert
      .dom('tbody tr')
      .exists({ count: instances.role.grant_scope_ids.length });
  });

  test('user can naviage to scope from role grant scopes', async function (assert) {
    await visit(urls.roleScopes);
    await click('tbody tr:nth-child(2) a');
    assert.strictEqual(
      currentURL(),
      `/scopes/${instances.scopes.org.id}/scopes`,
    );
  });

  test('user can naviage to parent scope from role grant scopes', async function (assert) {
    await visit(urls.roleScopes);
    await click('tbody tr:nth-child(2) td:nth-child(3) a');
    assert.strictEqual(
      currentURL(),
      `/scopes/${instances.scopes.global.id}/scopes`,
    );
  });
});
