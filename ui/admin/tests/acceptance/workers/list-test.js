import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | workers | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
    },
  };

  const urls = {
    globalScope: null,
    workers: null,
  };

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.user = this.server.create('user', {
      scope: instances.scopes.global,
    });
    urls.globalScope = `/scopes/global/scopes`;
    urls.workers = `/scopes/global/workers`;
    authenticateSession({});
  });

  test('Users can navigate to workers with proper authorization', async function (assert) {
    assert.expect(2);
    await visit(urls.globalScope);
    assert.ok(
      instances.scopes.global.authorized_collection_actions.workers.includes(
        'list'
      )
    );
    assert.dom(`[href="${urls.workers}"]`).isVisible();
  });

  test('Users cannot navigate to workers without list or create permissions', async function (assert) {
    assert.expect(1);
    instances.scopes.global.authorized_collection_actions.workers = [];

    await visit(urls.globalScope);
    assert.dom(`[href="${urls.workers}"]`).isNotVisible();
  });

  test('Users can navigate to workers with only create permission', async function (assert) {
    assert.expect(1);
    instances.scopes.global.authorized_collection_actions.workers = [
      'create:worker-led',
    ];

    await visit(urls.globalScope);
    assert.dom(`[href="${urls.workers}"]`).isVisible();
  });

  test('Users can navigate to workers with only list permission', async function (assert) {
    assert.expect(1);
    instances.scopes.global.authorized_collection_actions.workers = ['list'];

    await visit(urls.globalScope);
    assert.dom(`[href="${urls.workers}"]`).isVisible();
  });
});
