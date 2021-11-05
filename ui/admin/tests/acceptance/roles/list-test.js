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

module('Acceptance | roles | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
  };

  const urls = {
    scopes: {
      org: null,
    },
    roles: null,
  };

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.role = this.server.create('role', {
      scope: instances.scopes.org,
    });
    urls.scopes.org = `/scopes/${instances.scopes.org.id}`;

    urls.roles = `/scopes/${instances.scopes.org.id}/roles`;
    authenticateSession({});
  });

  test('Users can navigate to roles with proper authorization', async function (assert) {
    assert.expect(2);
    await visit(urls.scopes.org);
    assert.ok(
      instances.scopes.org.authorized_collection_actions.roles.includes('list')
    );
    assert.ok(find(`[href="${urls.roles}"]`));
  });

  test('Users cannot navigate to index without either list or create actions', async function (assert) {
    assert.expect(2);
    instances.scopes.org.authorized_collection_actions.roles = [];
    await visit(urls.scopes.org);
    assert.notOk(
      instances.scopes.org.authorized_collection_actions.roles.includes('list')
    );
    assert.notOk(find(`[href="${urls.roles}"]`));
  });

  test('Users can navigate to index with only create action', async function (assert) {
    assert.expect(1);
    instances.scopes.org.authorized_collection_actions.roles = ['create'];
    await visit(urls.scopes.org);
    assert.ok(find(`[href="${urls.roles}"]`));
  });
});
