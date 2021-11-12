import { module, test } from 'qunit';
import { visit, currentURL, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

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
    orgScope: null,
    authMethods: null,
    managedGroups: null,
    managedGroup: null,
    managedGroupMembers: null,
  };

  hooks.beforeEach(function () {
    authenticateSession({});
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.authMethod = this.server.create(
      'auth-method',
      {
        scope: instances.scopes.org,
        type: 'oidc',
      },
      'withAccountsAndUsersAndManagedGroups'
    );

    instances.managedGroup = this.server.db.managedGroups[0];
    // Generate route URLs for resources
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.authMethods = `${urls.orgScope}/auth-methods`;
    urls.authMethod = `${urls.authMethods}/${instances.authMethod.id}`;
    urls.managedGroups = `${urls.authMethod}/managed-groups`;
    urls.managedGroup = `${urls.managedGroups}/${instances.managedGroup.id}`;
    urls.managedGroupMembers = `${urls.managedGroup}/members`;
  });

  test('User can navigate to index', async function (assert) {
    assert.expect(3);
    const membersCount = instances.managedGroup.memberIds.length;
    await visit(urls.managedGroupMembers);
    await a11yAudit();
    assert.equal(currentURL(), urls.managedGroupMembers);
    assert.ok(membersCount);
    assert.equal(findAll('tbody tr').length, membersCount);
  });
});
