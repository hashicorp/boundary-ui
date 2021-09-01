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

module('Acceptance | targets | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

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
      project: null,
    },
    targets: null,
    projectScope: null,
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
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.orgScope.id, type: 'org' },
    });
    instances.target = this.server.create('target', {
      scope: instances.scopes.project,
    });
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.targets = `${urls.projectScope}/targets`;
    authenticateSession({});
  });

  test('can navigate to targets with proper authorization', async function (assert) {
    assert.expect(2);
    await visit(urls.projectScope);
    assert.ok(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'list'
      )
    );
    assert.ok(find(`[href="${urls.targets}"]`));
  });

  test('User cannot navigate to index without either list or create actions', async function (assert) {
    assert.expect(2);
    instances.scopes.project.authorized_collection_actions.targets = [];
    await visit(urls.projectScope);
    assert.notOk(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'list'
      )
    );
    assert.notOk(find(`[href="${urls.targets}"]`));
  });

  test('User can navigate to index with only create action', async function (assert) {
    assert.expect(1);
    instances.scopes.project.authorized_collection_actions.targets = ['create'];
    await visit(urls.projectScope);
    assert.ok(find(`[href="${urls.targets}"]`));
  });
});
