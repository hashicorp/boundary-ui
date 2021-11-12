import { module, test } from 'qunit';
import { visit, currentURL, click, find, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';

module('Acceptance | managed-groups | create', function (hooks) {
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

  test('visiting managed groups', async function (assert) {
    assert.expect(1);
    await visit(urls.managedGroups);
    await a11yAudit();
    assert.equal(currentURL(), urls.managedGroups);
  });

  test('can create a new managed group', async function (assert) {
    assert.expect(1);
    const managedGroupsCount = this.server.db.managedGroups.length;
    await visit(urls.newManagedGroup);
    await fillIn('[name="name"]', 'Managed group name');
    await fillIn('[name="description"]', 'description');
    await click('form [type="submit"]:not(:disabled)');
    assert.equal(this.server.db.managedGroups.length, managedGroupsCount + 1);
  });

  test('User can not create a new managed group without proper authorization', async function (assert) {
    assert.expect(2);
    instances.authMethod.authorized_collection_actions['managed-groups'] = [];
    await visit(urls.authMethod);
    assert.notOk(
      instances.authMethod.authorized_collection_actions[
        'managed-groups'
      ].includes('create')
    );
    assert.notOk(
      find(`.rose-layout-page-actions [href="${urls.newManagedGroup}"]`)
    );
  });

  test('User can navigate to new managed group route with proper authorization', async function (assert) {
    assert.expect(2);
    await visit(urls.managedGroups);
    assert.ok(
      instances.authMethod.authorized_collection_actions[
        'managed-groups'
      ].includes('create')
    );
    assert.ok(find(`[href="${urls.newManagedGroup}"]`));
  });

  test('User cannot navigate to new managed group route without proper authorization', async function (assert) {
    assert.expect(2);
    instances.authMethod.authorized_collection_actions['managed-groups'] = [];
    await visit(urls.managedGroups);
    assert.notOk(
      instances.authMethod.authorized_collection_actions[
        'managed-groups'
      ].includes('create')
    );
    assert.notOk(find(`[href="${urls.newManagedGroup}"]`));
  });

  test('User can cancel a new managed group creation', async function (assert) {
    assert.expect(2);
    const managedGroupsCount = this.server.db.managedGroups.length;
    await visit(urls.newManagedGroup);
    await fillIn('[name="name"]', 'Managed group name');
    await click('form button:not([type="submit"])');
    assert.equal(this.server.db.managedGroups.length, managedGroupsCount);
    assert.equal(currentURL(), urls.managedGroups);
  });

  test('When user saving a new managed group with invalid fields displays error message', async function (assert) {
    assert.expect(2);
    this.server.post('/managed-groups', () => {
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
        }
      );
    });
    await visit(urls.newManagedGroup);
    await fillIn('[name="name"]', 'new managed group');
    await click('form [type="submit"]');
    await a11yAudit();
    assert.equal(
      find('.rose-notification-body').textContent.trim(),
      'The request was invalid.',
      'Displays primary error message.'
    );
    assert.equal(
      find('.rose-form-error-message').textContent.trim(),
      'Name is required.',
      'Displays field-level errors.'
    );
  });
});
