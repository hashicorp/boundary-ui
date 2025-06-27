/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { TYPE_AUTH_METHOD_OIDC } from 'api/models/auth-method';

module('Acceptance | managed-groups | members', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    authMethod: null,
    managedGroup: null,
    accounts: null,
  };
  const urls = {
    authMethods: null,
    authMethod: null,
    managedGroups: null,
    managedGroup: null,
    managedGroupMembers: null,
  };

  hooks.beforeEach(async function () {
    await authenticateSession({ username: 'admin' });
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.authMethod = this.server.create(
      'auth-method',
      {
        scope: instances.scopes.org,
        type: TYPE_AUTH_METHOD_OIDC,
      },
      'withAccountsAndUsersAndManagedGroups',
    );
    instances.managedGroup = this.server.schema.managedGroups.first();

    // Generate route URLs for resources
    urls.authMethods = `/scopes/${instances.scopes.org.id}/auth-methods`;
    urls.authMethod = `${urls.authMethods}/${instances.authMethod.id}`;
    urls.managedGroups = `${urls.authMethod}/managed-groups`;
    urls.managedGroup = `${urls.managedGroups}/${instances.managedGroup.id}`;
    urls.managedGroupMembers = `${urls.managedGroup}/members`;
  });

  test('User can navigate to index', async function (assert) {
    const membersCount = instances.managedGroup.memberIds.length;
    await visit(urls.managedGroupMembers);

    await a11yAudit();
    assert.strictEqual(currentURL(), urls.managedGroupMembers);
    assert.ok(membersCount);
    assert.dom('tbody tr').exists({ count: membersCount });
  });
});
