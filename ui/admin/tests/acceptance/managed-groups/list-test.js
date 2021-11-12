import { module, test } from 'qunit';
import { visit, click, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | managed-groups | list', function (hooks) {
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
    urls.managedGroup = `${urls.managedGroups}/${instances.authMethod.id}`;
  });

  hooks.afterEach(async function () {
    const notification = find('.rose-notification');
    if (notification) {
      await click('.rose-notification-dismiss');
    }
  });

  test('User can navigate to managed groups with proper authorization', async function (assert) {
    assert.expect(2);
    await visit(urls.authMethod);
    assert.ok(
      instances.authMethod.authorized_collection_actions[
        'managed-groups'
      ].includes('list')
    );
    assert.ok(find(`[href="${urls.managedGroups}"]`));
  });

  test('User cannot navigate to index without either list or create actions', async function (assert) {
    assert.expect(2);
    instances.authMethod.authorized_collection_actions['managed-groups'] = [];
    await visit(urls.authMethod);
    assert.notOk(
      instances.authMethod.authorized_collection_actions[
        'managed-groups'
      ].includes('list')
    );
    assert.notOk(find(`[href="${urls.managedGroups}"]`));
  });

  test('User can navigate to index with only create action', async function (assert) {
    assert.expect(2);
    instances.authMethod.authorized_collection_actions['managed-groups'] = [
      'create',
    ];
    await visit(urls.authMethod);
    assert.ok(find(`[href="${urls.managedGroups}"]`));
    assert.ok(
      find(`.rose-layout-page-actions [href="${urls.newManagedGroup}"]`)
    );
  });
});
