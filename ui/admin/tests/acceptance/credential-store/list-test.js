import { module, test } from 'qunit';
import { visit, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | credential-stores | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
  };

  const urls = {
    scopes: {
      org: null,
    },
    projectScope: null,
    credentialStores: null,
    credentialStore: null,
  };

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    instances.credentialStore = this.server.create('credential-store', {
      scope: instances.scopes.project,
    });
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.credentialStores = `${urls.projectScope}/credential-stores`;
    authenticateSession({});
  });

  test('Users can navigate to credential-stores with proper authorization', async function (assert) {
    assert.expect(2);
    await visit(urls.projectScope);
    assert.ok(
      instances.scopes.project.authorized_collection_actions[
        'credential-stores'
      ].includes('list')
    );
    assert.ok(find(`[href="${urls.credentialStores}"]`));
  });

  test('Users cannot navigate to index without either list or create actions', async function (assert) {
    assert.expect(2);
    instances.scopes.project.authorized_collection_actions[
      'credential-stores'
    ] = [];
    await visit(urls.projectScope);
    assert.notOk(
      instances.scopes.project.authorized_collection_actions[
        'credential-stores'
      ].includes('list')
    );
    assert.notOk(find(`[href="${urls.credentialStores}"]`));
  });

  test('Users can navigate to index with only create action', async function (assert) {
    assert.expect(1);
    instances.scopes.project.authorized_collection_actions[
      'credential-stores'
    ] = ['create'];
    await visit(urls.projectScope);
    assert.ok(find(`[href="${urls.credentialStores}"]`));
  });
});
