import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | target', function(hooks) {
  setupTest(hooks);

  test('it serializes targets normally, without host sets', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('target');
    const record = store.createRecord('target', {
      name: 'User',
      description: 'Description',
      host_sets: [
        { host_set_id: '1', host_catalog_id: '2' },
        { host_set_id: '3', host_catalog_id: '4' }
      ],
      version: 1
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {};
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      name: 'User',
      description: 'Description',
      version: 1,
      protocol: null
    });

  });

  test('it serializes only host sets and version when an `adapterOptions.hostSets` array is passed', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('target');
    const record = store.createRecord('target', {
      name: 'User',
      description: 'Description',
      host_sets: [
        { host_set_id: '1', host_catalog_id: '2' },
        { host_set_id: '3', host_catalog_id: '4' }
      ],
      version: 1
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {
      hostSets: [{id: '4'}, {id: '5'}]
    };
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      host_set_ids: ['4', '5'],
      version: 1
    });
  });

  test('it normalizes records with array fields', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('target');
    const targetModelClass = store.createRecord('target').constructor;
    const payload = {
      id: '1',
      name: 'Target 1',
      host_sets: [
        { host_set_id: '1', host_catalog_id: '2' },
        { host_set_id: '3', host_catalog_id: '4' }
      ]
    };
    const normalized = serializer.normalizeSingleResponse(
      store,
      targetModelClass,
      payload
    );
    assert.deepEqual(normalized, {
      included: [],
      data: {
        id: '1',
        type: 'target',
        attributes: {
          name: 'Target 1',
          host_sets: [
            { host_set_id: '1', host_catalog_id: '2' },
            { host_set_id: '3', host_catalog_id: '4' }
          ]
        },
        relationships: {},
      },
    });
  });

});
