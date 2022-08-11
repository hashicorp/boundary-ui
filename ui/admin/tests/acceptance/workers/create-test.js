import { module, test } from 'qunit';
import { visit, fillIn, click, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | workers | create', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let globalScope;
  let workersURL;
  let newWorkerURL;

  hooks.beforeEach(function () {
    globalScope = this.server.create('scope', { id: 'global' });

    workersURL = `/scopes/global/workers`;
    newWorkerURL = `${workersURL}/new`;

    authenticateSession({});
  });

  test('can create new workers', async function (assert) {
    assert.expect(1);
    const workersCount = this.server.db.workers.length;
    await visit(newWorkerURL);
    await fillIn('[name="worker_auth_registration_request"]', 'token');
    await click('[type="submit"]');
    assert.strictEqual(this.server.db.workers.length, workersCount + 1);
  });

  test('Users can navigate to new workers route with proper authorization', async function (assert) {
    assert.expect(2);
    await visit(newWorkerURL);
    assert.ok(
      globalScope.authorized_collection_actions.workers.includes(
        'create:worker-led'
      )
    );
    assert.dom(`[href="${newWorkerURL}"]`).isVisible();
  });

  test('Users cannot navigate to new workers route without proper authorization', async function (assert) {
    assert.expect(2);
    globalScope.authorized_collection_actions.workers = [];
    await visit(workersURL);
    assert.notOk(
      globalScope.authorized_collection_actions.users.includes(
        'create:worker-led'
      )
    );
    assert.dom(`[href="${newWorkerURL}"]`).isNotVisible();
  });

  test('saving a new user with invalid fields displays error messages', async function (assert) {
    assert.expect(1);
    this.server.post('/workers:create:worker-led', () => {
      return new Response(
        500,
        {},
        {
          status: 500,
          code: 'api_error',
          message: 'rpc error: code = Unknown',
        }
      );
    });
    await visit(newWorkerURL);
    await fillIn('[name="worker_auth_registration_request"]', 'token');
    await click('[type="submit"]');
    assert.strictEqual(
      find('.rose-notification-body').textContent.trim(),
      'rpc error: code = Unknown',
      'Displays primary error message.'
    );
  });
});
