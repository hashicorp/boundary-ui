import { module, test } from 'qunit';
import { visit, click, find, fillIn, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | workers | update', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let orgScope;
  let workersURL;
  let workerURL;

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    worker: null,
  };

  hooks.beforeEach(function () {
    orgScope = this.server.create(
      'scope',
      {
        type: 'org',
      },
      'withChildren'
    );

    instances.worker = this.server.create('worker', {
      scope: orgScope,
    });

    workersURL = `/scopes/${orgScope}/workers`;
    workerURL = `${workersURL}/${instances.worker.id}`;

    authenticateSession({});
  });

  test('can save changes to an existing worker', async function (assert) {
    assert.expect(2);
    await visit(workerURL);
    await click('form [type="button"]', 'Click edit mode');
    await fillIn('[name="name"]', 'Updated worker name');
    await click('.rose-form-actions [type="submit"]');
    assert.strictEqual(currentURL(), workerURL);
    assert.strictEqual(this.server.db.workers[0].name, 'Updated worker name');
  });

  test('can cancel changes to an existing worker', async function (assert) {
    assert.expect(1);
    await visit(workerURL);
    await click('form [type="button"]', 'Click edit mode');
    await fillIn('[name="name"]', 'Unsaved worker name');
    await click('.rose-form-actions [type="button"]');
    assert.notEqual(find('[name="name"]').value, 'Unsaved worker name');
  });

  test('saving an existing worker with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.patch('/workers/:id', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {
            request_fields: [
              {
                name: 'name',
                description: 'Name is required',
              },
            ],
          },
        }
      );
    });
    await visit(workerURL);
    await click('.rose-form-actions [type="button"]', 'Click edit mode');
    await fillIn('[name="name"]', 'Worker Name');
    await click('[type="submit"]');
    assert.strictEqual(
      find('.rose-notification-body').textContent.trim(),
      'The request was invalid.',
      'Displays primary error message.'
    );
    assert.strictEqual(
      find('.rose-form-error-message').textContent.trim(),
      'Name is required',
      'Displays field-level errors.'
    );
  });
});
