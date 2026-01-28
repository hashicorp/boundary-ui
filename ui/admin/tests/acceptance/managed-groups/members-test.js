/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { TYPE_AUTH_METHOD_OIDC } from 'api/models/auth-method';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | managed-groups | members', function (hooks) {
  setupApplicationTest(hooks);

  const instances = {
    scopes: {
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
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const membersCount = instances.managedGroup.memberIds.length;
    await visit(urls.managedGroupMembers);

    assert.strictEqual(currentURL(), urls.managedGroupMembers);
    assert.ok(membersCount);
    assert.dom('tbody tr').exists({ count: membersCount });
  });
});
