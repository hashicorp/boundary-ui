import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | host set', function(hooks) {
  setupTest(hooks);

  test('it serializes host sets normally, without host_ids', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('host-set');
    const record = store.createRecord('host-set', {
      name: 'Host Set 1',
      description: 'Description',
      host_catalog_id: '123',
      version: 1
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {};
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      name: 'Host Set 1',
      description: 'Description',
      host_catalog_id: '123',
      version: 1
    });
  });

  test('it serializes only host_ids when `adapterOptions.hostIDs` is true', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('host-set');
    const record = store.createRecord('host-set', {
      name: 'Host Set 1',
      description: 'Description',
      host_ids: [{value: '1'}, {value: '2'}, {value: '3'}],
      version: 1
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {
      hostIDs: ['4', '5']
    };
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      host_ids: ['4', '5'],
      version: 1
    });
  });

  test('it normalizes records with array fields', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('host-set');
    const hostSetModelClass = store.createRecord('host-set').constructor;
    const payload = {
      id: '1',
      name: 'Host Set 1',
      host_ids: ['1', '2', '3']
    };
    const normalized = serializer.normalizeSingleResponse(
      store,
      hostSetModelClass,
      payload
    );
    assert.deepEqual(normalized, {
      included: [],
      data: {
        id: '1',
        type: 'host-set',
        attributes: {
          name: 'Host Set 1',
          host_ids: [{value: '1'}, {value: '2'}, {value: '3'}],
        },
        relationships: {},
      },
    });
  });

  test('it normalizes missing host_ids to empty array', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('host-set');
    const hostSet = store.createRecord('host-set').constructor;
    const payload = {
      id: '1',
      name: 'Host Set 1',
      scope: { id: 'o_123' }
    };
    const normalized = serializer.normalizeSingleResponse(
      store,
      hostSet,
      payload
    );
    assert.deepEqual(normalized, {
      included: [],
      data: {
        id: '1',
        type: 'host-set',
        attributes: {
          name: 'Host Set 1',
          scope: { scope_id: 'o_123' },
          host_ids: []
        },
        relationships: {},
      },
    });
  });

});
