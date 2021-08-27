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
    urls.orgScope = this.server.create(
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
    instances.group = this.server.create('group', {
      scope: instances.org,
    });
    orgURL = `/scopes/${urls.orgScope.id}`;
    //urls.orgScope = `/scopes/${instances.org.id}/scopes`;

    urls.groups = `/scopes/${urls.orgScope.id}/groups`;
    authenticateSession({});
  });

  test('can navigate to groups with proper authorization', async function (assert) {
    assert.expect(2);
    await visit(orgURL);
    assert.ok(
      urls.orgScope.authorized_collection_actions.groups.includes('list')
    );
    assert.ok(find(`[href="${urls.groups}"]`));
  });

  test('User cannot navigate to index without either list or create actions', async function (assert) {
    assert.expect(2);
    urls.orgScope.authorized_collection_actions.groups = [];
    await visit(orgURL);
    assert.notOk(
      urls.orgScope.authorized_collection_actions.groups.includes('list')
    );
    assert.notOk(find(`[href="${urls.groups}"]`));
  });

  test('User can navigate to index with only create action', async function (assert) {
    assert.expect(1);
    urls.orgScope.authorized_collection_actions.groups = ['create'];
    await visit(orgURL);
    assert.ok(find(`[href="${urls.groups}"]`));
  });
});
