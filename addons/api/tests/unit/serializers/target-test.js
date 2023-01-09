import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TYPE_TARGET_TCP, TYPE_TARGET_SSH } from 'api/models/target';

module('Unit | Serializer | target', function (hooks) {
  setupTest(hooks);

  test('it serializes targets normally, without host sets or credential libraries', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('target');
    const record = store.createRecord('target', {
      name: 'User',
      description: 'Description',
      host_sources: [
        { host_source_id: '1', host_catalog_id: '2' },
        { host_source_id: '3', host_catalog_id: '4' },
      ],
      brokered_credential_source_ids: [{ value: '1' }, { value: '2' }],
      injected_application_credential_source_ids: [
        { value: '4' },
        { value: '5' },
      ],
      scope: {
        scope_id: 'org_1',
        type: 'org',
      },
      default_port: 1234,
      version: 1,
      type: TYPE_TARGET_TCP,
      address: '0.0.0.0',
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {};
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      name: 'User',
      description: 'Description',
      version: 1,
      type: TYPE_TARGET_TCP,
      scope_id: 'org_1',
      session_max_seconds: 28800,
      session_connection_limit: null,
      worker_filter: null,
      egress_worker_filter: null,
      ingress_worker_filter: null,
      attributes: {
        default_port: 1234,
      },
      address: '0.0.0.0',
    });
  });

  test('it serializes only host sources and version when an `adapterOptions.hostSetIDs` array is passed', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('target');
    const record = store.createRecord('target', {
      name: 'User',
      description: 'Description',
      host_sources: [
        { host_source_id: '1', host_catalog_id: '2' },
        { host_source_id: '3', host_catalog_id: '4' },
      ],
      version: 1,
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {
      hostSetIDs: ['4', '5'],
    };
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      host_source_ids: ['4', '5'],
      version: 1,
    });
  });

  test('it serializes only credential sources and version when an `adapterOptions.brokeredCredentialSourceIDs` array is passed', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('target');
    const record = store.createRecord('target', {
      name: 'User',
      description: 'Description',
      brokered_credential_source_ids: [{ value: '1' }, { value: '2' }],
      version: 1,
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {
      brokeredCredentialSourceIDs: ['4', '5'],
    };
    const serializedRecord = serializer.serialize(snapshot);

    assert.deepEqual(serializedRecord, {
      brokered_credential_source_ids: ['4', '5'],
      version: 1,
    });
  });

  test('it serializes only credential sources and version when an `adapterOptions.injectedApplicationCredentialSourceIDs` array is passed', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('target');
    const record = store.createRecord('target', {
      name: 'User',
      description: 'Description',
      injected_application_credential_source_ids: [
        { value: '1' },
        { value: '2' },
      ],
      version: 1,
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {
      injectedApplicationCredentialSourceIDs: ['4', '5'],
    };
    const serializedRecord = serializer.serialize(snapshot);

    assert.deepEqual(serializedRecord, {
      injected_application_credential_source_ids: ['4', '5'],
      version: 1,
    });
  });

  test('it serializes the worker_filter attribute if present', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('target');
    const record = store.createRecord('target', {
      name: 'User',
      description: 'Description',
      version: 1,
      type: TYPE_TARGET_SSH,
      worker_filter: 'worker',
      default_port: 1234,
      scope: {
        scope_id: 'org_1',
      },
    });
    const snapshot = record._createSnapshot();
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      name: 'User',
      description: 'Description',
      version: 1,
      type: TYPE_TARGET_SSH,
      scope_id: 'org_1',
      session_max_seconds: 28800,
      session_connection_limit: null,
      worker_filter: 'worker',
      egress_worker_filter: null,
      ingress_worker_filter: null,
      attributes: {
        default_port: 1234,
      },
      address: null,
    });
  });

  test('it serializes the egress_worker_filter attribute if present', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('target');
    const record = store.createRecord('target', {
      name: 'User',
      description: 'Description',
      version: 1,
      type: TYPE_TARGET_SSH,
      egress_worker_filter: 'egress worker',
      default_port: 1234,
      scope: {
        scope_id: 'org_1',
      },
    });
    const snapshot = record._createSnapshot();
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      name: 'User',
      description: 'Description',
      version: 1,
      type: TYPE_TARGET_SSH,
      scope_id: 'org_1',
      session_max_seconds: 28800,
      session_connection_limit: null,
      worker_filter: null,
      egress_worker_filter: 'egress worker',
      ingress_worker_filter: null,
      attributes: {
        default_port: 1234,
      },
      address: null,
    });
  });

  test('it serializes the ingress_worker_filter attribute if present', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('target');
    const record = store.createRecord('target', {
      name: 'User',
      description: 'Description',
      version: 1,
      type: TYPE_TARGET_SSH,
      ingress_worker_filter: 'ingress worker',
      default_port: 1234,
      scope: {
        scope_id: 'org_1',
      },
    });
    const snapshot = record._createSnapshot();
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      name: 'User',
      description: 'Description',
      version: 1,
      type: TYPE_TARGET_SSH,
      scope_id: 'org_1',
      session_max_seconds: 28800,
      session_connection_limit: null,
      worker_filter: null,
      egress_worker_filter: null,
      ingress_worker_filter: 'ingress worker',
      attributes: {
        default_port: 1234,
      },
      address: null,
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
      host_sources: [
        { host_source_id: '1', host_catalog_id: '2' },
        { host_source_id: '3', host_catalog_id: '4' },
      ],
      brokered_credential_source_ids: ['1'],
      injected_application_credential_source_ids: ['3'],
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
          host_sources: [
            { host_source_id: '1', host_catalog_id: '2' },
            { host_source_id: '3', host_catalog_id: '4' },
          ],
          brokered_credential_source_ids: [{ value: '1' }],
          injected_application_credential_source_ids: [{ value: '3' }],
        },
        relationships: {},
      },
    });
  });

  test('it normalizes records with nested attributes', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('target');
    const targetModelClass = store.createRecord('target').constructor;
    const payload = {
      id: '1',
      name: 'Target 1',
      attributes: {
        default_port: 1234,
      },
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
          brokered_credential_source_ids: [],
          injected_application_credential_source_ids: [],
          authorized_actions: [],
          host_sources: [],
          name: 'Target 1',
          default_port: 1234,
        },
        relationships: {},
      },
    });
  });

  test('it normalizes missing host_sources and brokered_credential_source_ids to empty array', function (assert) {
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
          scope: { id: 'o_123', scope_id: 'o_123' },
          host_sources: [],
          brokered_credential_source_ids: [],
          injected_application_credential_source_ids: [],
        },
        relationships: {},
      },
    });
  });

  test('it normalizes the worker_filter attribute if present', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('target');
    const target = store.createRecord('target').constructor;
    const payload = {
      id: '1',
      name: 'Target 1',
      worker_filter: 'worker',
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
          host_sources: [],
          brokered_credential_source_ids: [],
          injected_application_credential_source_ids: [],
          worker_filter: 'worker',
        },
        relationships: {},
      },
    });
  });

  test('it normalizes the egress_worker_filter attribute if present', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('target');
    const target = store.createRecord('target').constructor;
    const payload = {
      id: '1',
      name: 'Target 1',
      egress_worker_filter: 'egress worker',
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
          host_sources: [],
          brokered_credential_source_ids: [],
          injected_application_credential_source_ids: [],
          egress_worker_filter: 'egress worker',
        },
        relationships: {},
      },
    });
  });

  test('it normalizes the ingress_worker_filter attribute if present', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('target');
    const target = store.createRecord('target').constructor;
    const payload = {
      id: '1',
      name: 'Target 1',
      ingress_worker_filter: 'ingress worker',
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
          host_sources: [],
          brokered_credential_source_ids: [],
          injected_application_credential_source_ids: [],
          ingress_worker_filter: 'ingress worker',
        },
        relationships: {},
      },
    });
  });
});
