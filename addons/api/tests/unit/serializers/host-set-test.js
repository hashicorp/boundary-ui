import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | host set', function (hooks) {
  setupTest(hooks);

  test('it serializes host sets normally, without host_ids', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('host-set', {
      name: 'Host Set 1',
      compositeType: 'static',
      description: 'Description',
      host_catalog_id: '123',
      version: 1,
    });
    assert.deepEqual(record.serialize(), {
      name: 'Host Set 1',
      description: 'Description',
      host_catalog_id: '123',
      version: 1,
    });
  });

  test('it serializes only host_ids when `adapterOptions.hostIDs` is true', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('host-set');
    const record = store.createRecord('host-set', {
      name: 'Host Set 1',
      description: 'Description',
      host_ids: [{ value: '1' }, { value: '2' }, { value: '3' }],
      version: 1,
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {
      hostIDs: ['4', '5'],
    };
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      host_ids: ['4', '5'],
      version: 1,
    });
  });

  test('it serializes host sets as expected for Aws plugin', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('host-set', {
      name: 'Host Set 1',
      compositeType: 'aws',
      description: 'Description',
      host_catalog_id: '123',
      version: 1,
      preferred_endpoints: [{ value: 'option 1' }, { value: 'option 2' }],
      sync_interval_seconds: 1,
      filters: [{ value: 'filter 1' }, { value: 'filter 2' }],
    });
    assert.deepEqual(record.serialize(), {
      name: 'Host Set 1',
      description: 'Description',
      host_catalog_id: '123',
      version: 1,
      preferred_endpoints: ['option 1', 'option 2'],
      sync_interval_seconds: 1,
      attributes: {
        filters: ['filter 1', 'filter 2'],
      },
    });
  });

  test('it serializes host sets as expected for Azure plugin', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('host-set', {
      name: 'Host Set 1',
      compositeType: 'azure',
      description: 'Description',
      host_catalog_id: '123',
      version: 1,
      preferred_endpoints: [{ value: 'option 1' }, { value: 'option 2' }],
      sync_interval_seconds: 1,
      filter: 'filter 1 && filter 2',
    });
    assert.deepEqual(record.serialize(), {
      name: 'Host Set 1',
      description: 'Description',
      host_catalog_id: '123',
      version: 1,
      preferred_endpoints: ['option 1', 'option 2'],
      sync_interval_seconds: 1,
      attributes: {
        filter: 'filter 1 && filter 2',
      },
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
      type: 'static',
      host_ids: ['1', '2', '3'],
      preferred_endpoints: ['endpoint 1', 'endpoint 2'],
      filters: ['filter 1', 'filter 2'],
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
          type: 'static',
          authorized_actions: [],
          name: 'Host Set 1',
          host_ids: [{ value: '1' }, { value: '2' }, { value: '3' }],
          preferred_endpoints: [
            { value: 'endpoint 1' },
            { value: 'endpoint 2' },
          ],
          filters: [{ value: 'filter 1' }, { value: 'filter 2' }],
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
      scope: { id: 'o_123' },
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
          authorized_actions: [],
          name: 'Host Set 1',
          scope: { scope_id: 'o_123' },
          host_ids: [],
          preferred_endpoints: [],
          filters: [],
        },
        relationships: {},
      },
    });
  });

  test('it normalizes missing array fields to empty array', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('host-set');
    const hostSet = store.createRecord('host-set').constructor;
    const payload = {
      id: '1',
      name: 'Host Set 1',
      scope: { id: 'o_123' },
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
          authorized_actions: [],
          name: 'Host Set 1',
          scope: { scope_id: 'o_123' },
          host_ids: [],
          preferred_endpoints: [],
          filters: [],
        },
        relationships: {},
      },
    });
  });
});
