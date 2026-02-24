/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TYPE_TARGET_TCP, TYPE_TARGET_SSH } from 'api/models/target';

module('Unit | Serializer | target', function (hooks) {
  setupTest(hooks);

  test('it serializes TCP targets normally, without host sets or credential libraries or session recording fields in the attributes', function (assert) {
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
      default_client_port: 4321,
      version: 1,
      type: TYPE_TARGET_TCP,
      address: '0.0.0.0',
      enable_session_recording: false,
      storage_bucket_id: null,
      with_aliases: [{ value: 'a' }],
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
      egress_worker_filter: null,
      ingress_worker_filter: null,
      with_aliases: [{ value: 'a', scope_id: 'global' }],
      attributes: {
        default_port: 1234,
        default_client_port: 4321,
      },
      address: '0.0.0.0',
    });
  });

  test('it serializes SSH targets normally with session recording fields in the attributes but without host sets or credential libraries', function (assert) {
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
      default_client_port: 4321,
      version: 1,
      type: TYPE_TARGET_SSH,
      enable_session_recording: false,
      storage_bucket_id: null,
      address: '0.0.0.0',
      with_aliases: [{ value: 'www.test.com' }],
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {};
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      name: 'User',
      description: 'Description',
      version: 1,
      type: TYPE_TARGET_SSH,
      scope_id: 'org_1',
      session_max_seconds: 28800,
      session_connection_limit: null,
      egress_worker_filter: null,
      ingress_worker_filter: null,
      with_aliases: [{ value: 'www.test.com', scope_id: 'global' }],
      attributes: {
        default_port: 1234,
        default_client_port: 4321,
        enable_session_recording: false,
        storage_bucket_id: null,
      },
      address: '0.0.0.0',
    });
  });

  test('it serializes only host sources and version when an `adapterOptions.hostSetIDs` array is passed', function (assert) {
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

  test('it serializes the storage_bucket_id attribute if present', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('target');
    const record = store.createRecord('target', {
      name: 'User',
      description: 'Description',
      version: 1,
      type: TYPE_TARGET_SSH,
      enable_session_recording: true,
      storage_bucket_id: 'bucketID',
      default_port: 1234,
      with_aliases: [],
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
      egress_worker_filter: null,
      ingress_worker_filter: null,
      with_aliases: [],
      attributes: {
        default_port: 1234,
        default_client_port: null,
        enable_session_recording: true,
        storage_bucket_id: 'bucketID',
      },
      address: null,
    });
  });

  test('it serializes the egress_worker_filter attribute if present', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('target');
    const record = store.createRecord('target', {
      name: 'User',
      description: 'Description',
      version: 1,
      type: TYPE_TARGET_SSH,
      egress_worker_filter: 'egress worker',
      default_port: 1234,
      with_aliases: [],
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
      egress_worker_filter: 'egress worker',
      ingress_worker_filter: null,
      with_aliases: [],
      attributes: {
        default_port: 1234,
        default_client_port: null,
        enable_session_recording: false,
        storage_bucket_id: null,
      },
      address: null,
    });
  });

  test('it serializes the ingress_worker_filter attribute if present', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('target');
    const record = store.createRecord('target', {
      name: 'User',
      description: 'Description',
      version: 1,
      type: TYPE_TARGET_SSH,
      ingress_worker_filter: 'ingress worker',
      default_port: 1234,
      with_aliases: [],
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
      egress_worker_filter: null,
      ingress_worker_filter: 'ingress worker',
      with_aliases: [],
      attributes: {
        default_port: 1234,
        default_client_port: null,
        enable_session_recording: false,
        storage_bucket_id: null,
      },
      address: null,
    });
  });

  test('it normalizes records with array fields', function (assert) {
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
      payload,
    );
    assert.deepEqual(normalized, {
      included: [],
      data: {
        id: '1',
        type: 'target',
        attributes: {
          aliases: [],
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
      payload,
    );
    assert.deepEqual(normalized, {
      included: [],
      data: {
        id: '1',
        type: 'target',
        attributes: {
          aliases: [],
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
      payload,
    );
    assert.deepEqual(normalized, {
      included: [],
      data: {
        id: '1',
        type: 'target',
        attributes: {
          aliases: [],
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

  test('it normalizes the egress_worker_filter attribute if present', function (assert) {
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
      payload,
    );
    assert.deepEqual(normalized, {
      included: [],
      data: {
        id: '1',
        type: 'target',
        attributes: {
          aliases: [],
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
      payload,
    );
    assert.deepEqual(normalized, {
      included: [],
      data: {
        id: '1',
        type: 'target',
        attributes: {
          aliases: [],
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

  test('it normalizes the storage_bucket_id attribute if present', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('target');
    const target = store.createRecord('target').constructor;
    const payload = {
      id: '1',
      name: 'Target 1',
      storage_bucket_id: 'bucketID',
      enable_session_recording: true,
    };
    const normalized = serializer.normalizeSingleResponse(
      store,
      target,
      payload,
    );
    assert.deepEqual(normalized, {
      included: [],
      data: {
        id: '1',
        type: 'target',
        attributes: {
          aliases: [],
          authorized_actions: [],
          name: 'Target 1',
          host_sources: [],
          brokered_credential_source_ids: [],
          injected_application_credential_source_ids: [],
          storage_bucket_id: 'bucketID',
          enable_session_recording: true,
        },
        relationships: {},
      },
    });
  });
});
