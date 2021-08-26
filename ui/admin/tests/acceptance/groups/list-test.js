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

module('Acceptance | groups | list', function (hooks) {
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
    groups: null,
    orgScope: null,
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
    instances.scopes.org = this.server.create('scope', {
        type: 'org',
        scope: { id: 'global', type: 'global' },
    });
    instances.group = this.server.create('group', {
      scope: instances.org,
    });
    urls.groups = `/scopes/${instances.scopes.org.id}/groups`;
    orgURL = `/scopes/${orgScope.id}`;

    authenticateSession({});
  });

  test('can navigate to groups with proper authorization', async function (assert) {
    assert.expect(2);
    orgScope.authorized_collection_actions.groups = ['list'];
    await visit(orgURL);
    assert.ok(orgScope.authorized_collection_actions.groups.includes('list'));
    assert.ok(find(`[href="${orgURL}/groups"]`));
  });

  test('cannot navigate to groups without proper authorization', async function (assert) {
    assert.expect(1);
    orgScope.authorized_collection_actions.groups = [];
    await visit(orgURL);
    assert.notOk(
      orgScope.authorized_collection_actions.groups.includes('list')
    );
    //assert.notOk(find(`[href="${orgURL}/groups"]`));
  });
});
