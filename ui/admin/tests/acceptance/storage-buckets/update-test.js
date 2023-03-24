import { module, test } from 'qunit';
import { visit, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | storage-buckets | update', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let features;

  const instances = {
    scopes: {
      global: null,
    },
    storageBucket: null,
  };

  const urls = {
    globalScope: null,
    storageBuckets: null,
    storageBucket: null,
  };

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.storageBucket = this.server.create('storage-bucket', {
      scope: instances.scopes.global,
    });
    urls.globalScope = `/scopes/global`;
    urls.storageBuckets = `${urls.globalScope}/storage-buckets`;
    (urls.storageBucket = `${urls.storageBuckets}/${instances.storageBucket.id}`),
      (features = this.owner.lookup('service:features'));
    features.enable('session-recording');
    authenticateSession({});
  });

  test('can save changes to an existing storage-bucket', async function (assert) {
    assert.expect(2);
    await visit(urls.storageBucket);
    await click('.rose-form-actions [type="button"]', 'Click edit mode');
    await fillIn('[name="name"]', 'Updated storage-bucket name');
    await click('.rose-form-actions [type="submit"]');
    assert.dom(`[href="${urls.storageBucket}"]`).isVisible();
    assert.dom('input[name="name"]').hasValue('Updated storage-bucket name');
  });

  test('can cancel changes to an existing storage-bucket', async function (assert) {
    assert.expect(1);
    const name = instances.storageBucket.name;
    await visit(urls.storageBucket);
    await click('.rose-form-actions [type="button"]', 'Click edit mode');
    await fillIn('[name="name"]', 'Updated storage-bucket name');
    await click('.rose-form-actions [type="button"]');
    await assert.dom('input[name="name"]').hasValue(`${name}`);
  });

  test('saving an existing storage-bucket with invalid fields will display error messages', async function (assert) {
    assert.expect(2);
    await visit(urls.storageBuckets);
    this.server.patch('/storage-buckets/:id', () => {
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
                name: 'region',
                description: 'Region is required.',
              },
            ],
          },
        }
      );
    });

    await click(`[href="${urls.storageBucket}"]`);
    await click('.rose-form-actions [type="button"]', 'Activate edit mode');
    await fillIn('[name="region"]', 'random string');
    await click('[type="submit"]');

    assert.dom('[role="alert"] div').hasText('The request was invalid.');
    assert.dom('.hds-form-error__message').hasText('Region is required.');
  });
});
