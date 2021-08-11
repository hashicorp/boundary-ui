import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | target', function (hooks) {
  setupTest(hooks);

  test('it serializes targets normally, without host sets or credential libraries', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('target');
    const record = store.createRecord('target', {
      name: 'User',
      description: 'Description',
      host_sets: [
        { host_set_id: '1', host_catalog_id: '2' },
        { host_set_id: '3', host_catalog_id: '4' },
      ],
      application_credential_library_ids: [{ value: '1' }, { value: '2' }],
      scope: {
        scope_id: 'org_1',
        type: 'org',
      },
      version: 1,
      type: 'tcp',
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {};
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      name: 'User',
      description: 'Description',
      version: 1,
      type: 'tcp',
      scope_id: 'org_1',
      session_max_seconds: 28800,
      session_connection_limit: 1,
      attributes: {
        default_port: null,
      },
    });
  });

  test('it serializes only host sets and version when an `adapterOptions.hostSetIDs` array is passed', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('target');
    const record = store.createRecord('target', {
      name: 'User',
      description: 'Description',
      host_sets: [
        { host_set_id: '1', host_catalog_id: '2' },
        { host_set_id: '3', host_catalog_id: '4' },
      ],
      version: 1,
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {
      hostSetIDs: ['4', '5'],
    };
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      host_set_ids: ['4', '5'],
      version: 1,
    });
  });

  test('it serializes only credential libraries and version when an `adapterOptions.credentialLibraryIDs` array is passed', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('target');
    const record = store.createRecord('target', {
      name: 'User',
      description: 'Description',
      application_credential_library_ids: [{ value: '1' }, { value: '2' }],
      version: 1,
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {
      credentialLibraryIDs: ['4', '5'],
    };
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      application_credential_library_ids: ['4', '5'],
      version: 1,
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
        { host_set_id: '3', host_catalog_id: '4' },
      ],
      application_credential_library_ids: ['1'],
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
          authorized_actions: [],
          name: 'Target 1',
          host_sets: [
            { host_set_id: '1', host_catalog_id: '2' },
            { host_set_id: '3', host_catalog_id: '4' },
          ],
          application_credential_library_ids: [{ value: '1' }],
        },
        relationships: {},
      },
    });
  });

  test('it normalizes missing host_sets and credential libraries to empty array', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('target');
    const target = store.createRecord('target').constructor;
    const payload = {
      id: '1',
      name: 'Target 1',
      scope: { id: 'o_123' },
    };
    const normalized = serializer.normalizeSingleResponse(
      store,
      target,
      payload
    );
    assert.deepEqual(normalized, {
      included: [],
      data: {
        id: '1',
        type: 'target',
        attributes: {
          authorized_actions: [],
          name: 'Target 1',
          scope: { scope_id: 'o_123' },
          host_sets: [],
          application_credential_library_ids: [],
        },
        relationships: {},
      },
    });
  });
});
