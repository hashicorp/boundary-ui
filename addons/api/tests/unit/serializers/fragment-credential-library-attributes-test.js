import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Serializer | fragment credential library attributes',
  function (hooks) {
    setupTest(hooks);

    test('it serializes empty strings to null', function (assert) {
      assert.expect(1);
      const store = this.owner.lookup('service:store');
      const record = store.createRecord(
        'fragment-credential-library-attributes',
        {
          http_method: '',
          path: null,
        }
      );
      let serializedRecord = record.serialize();
      assert.deepEqual(serializedRecord, {
        http_method: null,
        path: null,
      });
    });

    test('it does not serialize http_request_body unless http_method is set to POST', function (assert) {
      assert.expect(2);
      const store = this.owner.lookup('service:store');
      const record = store.createRecord(
        'fragment-credential-library-attributes',
        {
          http_method: 'GET',
          http_request_body: 'body',
        }
      );
      let serializedRecord = record.serialize();
      assert.deepEqual(
        serializedRecord,
        {
          http_method: 'GET',
          path: null,
        },
        'http_request_body attribute is not expected'
      );

      record.http_method = 'POST';
      serializedRecord = record.serialize();
      assert.deepEqual(
        serializedRecord,
        {
          http_method: 'POST',
          http_request_body: 'body',
          path: null,
        },
        'http_request_body attribute is expected'
      );
    });
  }
);
