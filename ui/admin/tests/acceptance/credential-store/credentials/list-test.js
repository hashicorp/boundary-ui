import { module, test } from 'qunit';
import { visit, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | credential-stores | credentials | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      org: null,
      project: null,
    },
  };

  const urls = {
    projectScope: null,
    credentialStores: null,
    staticCredentialStore: null,
    credentials: null,
    newCredential: null,
  };

  hooks.beforeEach(function () {
    // Generate resources
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    instances.staticCredentialStore = this.server.create('credential-store', {
      scope: instances.scopes.project,
      type: 'static',
    });
    // Generate route URLs for resources
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.credentialStores = `${urls.projectScope}/credential-stores`;
    urls.staticCredentialStore = `${urls.credentialStores}/${instances.staticCredentialStore.id}`;
    urls.credentials = `${urls.staticCredentialStore}/credentials`;
    urls.newCredential = `${urls.staticCredentialStore}/credentials/new`;
    authenticateSession({});
  });

  test('Users can navigate to credentials with proper authorization', async function (assert) {
    assert.expect(2);
    await visit(urls.staticCredentialStore);
    assert.ok(
      instances.staticCredentialStore.authorized_collection_actions.credentials.includes(
        'list'
      )
    );
    assert.ok(find(`[href="${urls.credentials}"]`));
  });

  test('User cannot navigate to index without either list or create action', async function (assert) {
    assert.expect(3);
    instances.staticCredentialStore.authorized_collection_actions.credentials =
      [];
    await visit(urls.staticCredentialStore);
    assert.notOk(
      instances.staticCredentialStore.authorized_collection_actions.credentials.includes(
        'list'
      )
    );
    assert.notOk(
      instances.staticCredentialStore.authorized_collection_actions.credentials.includes(
        'create'
      )
    );
    assert.notOk(find(`[href="${urls.credentials}"]`));
  });

  test('User can navigate to index with only create action', async function (assert) {
    assert.expect(2);
    instances.staticCredentialStore.authorized_collection_actions.credentials =
      ['create'];
    await visit(urls.staticCredentialStore);
    assert.ok(find(`[href="${urls.credentials}"]`));
    assert.ok(find(`.rose-layout-page-actions [href="${urls.newCredential}"]`));
  });
});
