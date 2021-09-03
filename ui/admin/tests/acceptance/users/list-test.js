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

module('Acceptance | users | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let orgURL;

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    orgScope: null,
  };

  const urls = {
    scopes: {
      org: null,
    },
    users: null,
  };

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.orgScope = this.server.create(
      'scope',
      {
        type: 'org',
        scope: { id: 'global', type: 'global' },
      },
      'withChildren'
    );
    instances.user = this.server.create('user', {
      scope: instances.orgScope,
    });
    orgURL = `/scopes/${instances.orgScope.id}`;
    urls.users = `/scopes/${instances.orgScope.id}/users`;
    authenticateSession({});
  });

  test('Users can navigate to users with proper authorization', async function (assert) {
    assert.expect(2);
    await visit(orgURL);
    assert.ok(
      instances.orgScope.authorized_collection_actions.users.includes('list')
    );
    assert.ok(find(`[href="${urls.users}"]`));
  });

  test('User cannot navigate to index without either list or create actions', async function (assert) {
    assert.expect(2);
    instances.orgScope.authorized_collection_actions.users = [];
    await visit(orgURL);
    assert.notOk(
      instances.orgScope.authorized_collection_actions.users.includes('list')
    );
    assert.notOk(find(`[href="${urls.users}"]`));
  });

  test('User can navigate to index with only create action', async function (assert) {
    assert.expect(1);
    instances.orgScope.authorized_collection_actions.users = ['create'];
    await visit(orgURL);
    assert.ok(find(`[href="${urls.users}"]`));
  });
});
