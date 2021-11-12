import { module, test } from 'qunit';
import { visit, click, find, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Acceptance | managed-groups | read', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    authMethod: null,
    managedGroup: null,
  };
  const urls = {
    orgScope: null,
    authMethods: null,
    managedGroups: null,
    newManagedGroup: null,
    managedGroup: null,
  };

  hooks.beforeEach(function () {
    authenticateSession({});
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.authMethod = this.server.create('auth-method', {
      scope: instances.scopes.org,
      type: 'oidc',
    });
    instances.managedGroup = this.server.create('managed-group', {
      scope: instances.scopes.org,
      authMethod: instances.authMethod,
    });
    // Generate route URLs for resources
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.authMethods = `${urls.orgScope}/auth-methods`;
    urls.authMethod = `${urls.authMethods}/${instances.authMethod.id}`;
    urls.managedGroups = `${urls.authMethod}/managed-groups`;
    urls.newManagedGroup = `${urls.managedGroups}/new`;
    // TODO refactor in the rest of the test this url
    urls.managedGroup = `${urls.managedGroups}/${instances.managedGroup.id}`;
  });

  hooks.afterEach(async function () {
    const notification = find('.rose-notification');
    if (notification) {
      await click('.rose-notification-dismiss');
    }
  });

  test('User can navigate to a managed group form', async function (assert) {
    assert.expect(1);
    await visit(urls.managedGroups);
    await click('main tbody .rose-table-header-cell:nth-child(1) a');
    await a11yAudit();
    assert.equal(currentURL(), urls.managedGroup);
  });

  test('User cannot navigate to a managed group form without proper authorization', async function (assert) {
    assert.expect(1);
    instances.managedGroup.authorized_actions =
      instances.managedGroup.authorized_actions.filter(
        (item) => item !== 'read'
      );
    await visit(urls.managedGroups);
    assert.notOk(find('main tbody .rose-table-header-cell:nth-child(1) a'));
  });
});
