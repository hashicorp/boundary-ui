import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | credential library', function (hooks) {
  setupTest(hooks);

  test('it serializes correctly on create', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('credential-library');
    const record = store.createRecord('credential-library', {
      type: 'vault',
      name: 'Name',
      description: 'Description',
      path: '/vault/path',
      http_method: 'GET',
      version: 1,
    });
    const snapshot = record._createSnapshot();
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      type: 'vault',
      credential_store_id: null,
      name: 'Name',
      description: 'Description',
      version: 1,
      attributes: {
        path: '/vault/path',
        http_method: 'GET',
      },
    });
  });

  test('it serializes correctly on update', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('credential-library');
    store.push({
      data: {
        id: '1',
        type: 'credential-library',
        attributes: {
          type: 'vault',
          name: 'Name',
          description: 'Description',
          path: '/vault/path',
          http_method: 'GET',
          version: 1,
        },
      },
    });
    const record = store.peekRecord('credential-library', '1');
    const snapshot = record._createSnapshot();
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      type: 'vault',
      credential_store_id: null,
      name: 'Name',
      description: 'Description',
      attributes: {
        path: '/vault/path',
        http_method: 'GET',
      },
      version: 1,
    });
  });

  test('it serializes empty strings to null', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('credential-library', {
      http_method: '',
      path: null,
    });
    let serializedRecord = record.serialize();
    assert.deepEqual(serializedRecord, {
      attributes: {
        http_method: null,
        path: null,
      },
      credential_store_id: null,
      description: null,
      name: null,
      type: null,
    });
  });

  test('it does not serialize http_request_body unless http_method is set to POST', function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('credential-library', {
      http_method: 'GET',
      http_request_body: 'body',
    });
    let serializedRecord = record.serialize();
    assert.deepEqual(
      serializedRecord,
      {
        attributes: {
          http_method: 'GET',
          path: null,
        },
        credential_store_id: null,
        description: null,
        name: null,
        type: null,
      },
      'http_request_body attribute is not expected'
    );

    record.http_method = 'POST';
    serializedRecord = record.serialize();
    assert.deepEqual(
      serializedRecord,
      {
        attributes: {
          http_method: 'POST',
          http_request_body: 'body',
          path: null,
        },
        credential_store_id: null,
        description: null,
        name: null,
        type: null,
      },
      'http_request_body attribute is expected'
    );
  });
});
