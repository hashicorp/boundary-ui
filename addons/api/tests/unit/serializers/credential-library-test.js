import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | credential library', function (hooks) {
  setupTest(hooks);

  test('it serializes correctly on create', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('credential-library');
    const record = store.createRecord('credential-library', {
      name: 'Name',
      description: 'Description',
      attributes: {
        path: '/vault/path',
        http_method: 'GET',
      },
      version: 1,
    });
    const snapshot = record._createSnapshot();
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
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
          name: 'Name',
          description: 'Description',
          attributes: {
            path: '/vault/path',
            http_method: 'GET',
          },
          version: 1,
        },
      },
    });
    const record = store.peekRecord('credential-library', '1');
    const snapshot = record._createSnapshot();
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
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
});
