import { module, test } from 'qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
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
    staticCredentialStore: null,
    usernamePasswordCredential: null,
    usernameKeyPairCredential: null,
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
    instances.usernamePasswordCredential = this.server.create('credential', {
      scope: instances.scopes.project,
      credentialStore: instances.staticCredentialStore,
      type: 'username_password',
    });
    instances.usernameKeyPairCredential = this.server.create('credential', {
      scope: instances.scopes.project,
      credentialStore: instances.staticCredentialStore,
      type: 'ssh_private_key',
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
    assert.expect(4);
    await visit(urls.staticCredentialStore);
    assert.ok(
      instances.staticCredentialStore.authorized_collection_actions.credentials.includes(
        'list'
      )
    );
    assert.dom(`[href="${urls.credentials}"]`).isVisible();
    await click(`[href="${urls.credentials}"]`);
    assert.strictEqual(currentURL(), urls.credentials);
    assert
      .dom('.rose-table-body .rose-table-row')
      .isVisible({ count: this.server.schema.credentials.all().models.length });
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
    assert.dom(`.rose-nav-tabs a[href="${urls.credentials}"]`).doesNotExist();
  });

  test('User can navigate to index with only create action', async function (assert) {
    assert.expect(2);
    instances.staticCredentialStore.authorized_collection_actions.credentials =
      ['create'];
    await visit(urls.staticCredentialStore);
    assert.dom(`[href="${urls.credentials}"]`).isVisible();
    assert
      .dom(`.rose-layout-page-actions [href="${urls.newCredential}"]`)
      .isVisible();
  });
});
