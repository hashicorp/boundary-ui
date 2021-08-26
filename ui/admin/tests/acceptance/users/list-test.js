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
  let orgScope;
  let orgURL;

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
    users: null,
  };

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    orgScope = this.server.create(
      'scope',
      {
        type: 'org',
        scope: { id: 'global', type: 'global' },
      },
      'withChildren'
    );
    instances.org = this.server.create(
      'scope',
      {
        type: 'org',
        scope: { id: 'global', type: 'global' },
      },
      'withChildren'
    );
    instances.user = this.server.create('user', {
      scope: instances.org,
    });
    orgURL = `/scopes/${orgScope.id}`;

    urls.users = `/scopes/${instances.org.id}/users`;
    authenticateSession({});
  });

  test('can navigate to users with proper authorization', async function (assert) {
    assert.expect(2);
    await visit(orgURL);
    assert.ok(orgScope.authorized_collection_actions.users.includes('create'));
    assert.ok(find(`[href="${orgURL}/users"]`));
  });

  test('cannot navigate to users with proper authorization', async function (assert) {
    assert.expect(2);
    orgScope.authorized_collection_actions.users = [];
    await visit(orgURL);
    assert.notOk(
      orgScope.authorized_collection_actions.users.includes('create')
    );
    assert.notOk(find(`[href="${orgURL}/users"]`));
  });
});
