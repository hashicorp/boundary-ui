import { module, test } from 'qunit';
import { visit, click, fillIn, findAll } from '@ember/test-helpers';
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

  const BUTTON_SELECTOR = '.rose-form-actions [type="button"]';
  const SAVE_BUTTON_SELECTOR = '.rose-form-actions [type="submit"]';
  const NAME_FIELD_SELECTOR = '[name="name"]';
  const REGION_FIELD_SELECTOR = '[name="region"]';
  const ALERT_TEXT_SELECTOR = '[role="alert"] div';
  const FIELD_ERROR_TEXT_SELECTOR = '.hds-form-error__message';
  const SECRET_FIELD_BUTTON_SELECTOR = '.secret-input [type="button"]';
  const ACCESS_KEY_ID_FIELD_SELECTOR = '[name="access_key_id"]';
  const SECRET_ACCESS_KEY_FIELD_SELECTOR = '[name="secret_access_key"]';
  const NAME_FIELD_TEXT = 'Updated storage-bucket name';
  const ACCESS_KEY_ID_FIELD_TEXT = 'Updated access key id';
  const SECRET_ACCESS_KEY_FIELD_TEXT = 'Update secret access key';

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
    urls.storageBucket = `${urls.storageBuckets}/${instances.storageBucket.id}`;

    features = this.owner.lookup('service:features');
    features.enable('ssh-session-recording');
    authenticateSession({});
  });

  test('can save changes to an existing storage-bucket', async function (assert) {
    assert.expect(3);
    await visit(urls.storageBuckets);

    await click(`[href="${urls.storageBucket}"]`);
    await click(BUTTON_SELECTOR, 'Click edit mode');
    await fillIn(NAME_FIELD_SELECTOR, NAME_FIELD_TEXT);
    await click(SAVE_BUTTON_SELECTOR, 'Click save');

    assert.dom(`[href="${urls.storageBucket}"]`).isVisible();
    assert.dom(NAME_FIELD_SELECTOR).hasValue(NAME_FIELD_TEXT);
    assert.strictEqual(instances.storageBucket.name, NAME_FIELD_TEXT);
  });

  test('can cancel changes to an existing storage-bucket', async function (assert) {
    assert.expect(2);
    const name = instances.storageBucket.name;
    await visit(urls.storageBuckets);

    await click(`[href="${urls.storageBucket}"]`);
    await click(BUTTON_SELECTOR, 'Click edit mode');
    await fillIn(NAME_FIELD_SELECTOR, NAME_FIELD_TEXT);
    await click(BUTTON_SELECTOR, 'Click cancel');

    assert.dom(NAME_FIELD_SELECTOR).hasValue(`${name}`);
    assert.strictEqual(instances.storageBucket.name, name);
  });

  test('can save changes to access key fields', async function (assert) {
    assert.expect(8);
    await visit(urls.storageBuckets);

    await click(`[href="${urls.storageBucket}"]`);

    assert.dom(SECRET_FIELD_BUTTON_SELECTOR).exists({ count: 2 });
    assert.dom(SECRET_FIELD_BUTTON_SELECTOR).isDisabled();

    await click(BUTTON_SELECTOR, 'Click edit mode');

    assert.dom(SECRET_FIELD_BUTTON_SELECTOR).isEnabled();
    assert.dom(SECRET_FIELD_BUTTON_SELECTOR).hasText('Edit');

    await click(SECRET_FIELD_BUTTON_SELECTOR);
    await click(findAll(SECRET_FIELD_BUTTON_SELECTOR)[1]);

    assert.dom(SECRET_FIELD_BUTTON_SELECTOR).hasText('Cancel');

    await fillIn(ACCESS_KEY_ID_FIELD_SELECTOR, ACCESS_KEY_ID_FIELD_TEXT);
    await fillIn(
      SECRET_ACCESS_KEY_FIELD_SELECTOR,
      SECRET_ACCESS_KEY_FIELD_TEXT
    );
    await click(SAVE_BUTTON_SELECTOR, 'Click save');

    assert.dom(SECRET_FIELD_BUTTON_SELECTOR).isDisabled();
    assert.dom(ACCESS_KEY_ID_FIELD_SELECTOR).hasNoValue();
    assert.dom(SECRET_ACCESS_KEY_FIELD_SELECTOR).hasNoValue();
  });

  test('can cancel changes to access key fields', async function (assert) {
    assert.expect(3);
    await visit(urls.storageBuckets);

    await click(`[href="${urls.storageBucket}"]`);
    await click(BUTTON_SELECTOR, 'Click edit mode');
    await click(SECRET_FIELD_BUTTON_SELECTOR, 'Click edit button');
    await click(findAll(SECRET_FIELD_BUTTON_SELECTOR)[1], 'Click edit button');
    await fillIn(ACCESS_KEY_ID_FIELD_SELECTOR, ACCESS_KEY_ID_FIELD_TEXT);
    await fillIn(
      SECRET_ACCESS_KEY_FIELD_SELECTOR,
      SECRET_ACCESS_KEY_FIELD_TEXT
    );
    await click(SECRET_FIELD_BUTTON_SELECTOR, 'Click cancel button');
    await click(
      findAll(SECRET_FIELD_BUTTON_SELECTOR)[1],
      'Click cancel button'
    );
    await click(SAVE_BUTTON_SELECTOR, 'Click save');

    assert.dom(SECRET_FIELD_BUTTON_SELECTOR).isDisabled();
    assert.dom(ACCESS_KEY_ID_FIELD_SELECTOR).hasNoValue();
    assert.dom(SECRET_ACCESS_KEY_FIELD_SELECTOR).hasNoValue();
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
    await click(BUTTON_SELECTOR, 'Activate edit mode');
    await fillIn(REGION_FIELD_SELECTOR, 'random string');
    await click(SAVE_BUTTON_SELECTOR);

    assert.dom(ALERT_TEXT_SELECTOR).hasText('The request was invalid.');
    assert.dom(FIELD_ERROR_TEXT_SELECTOR).hasText('Region is required.');
  });
});
