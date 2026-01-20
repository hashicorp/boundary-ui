/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TYPE_AUTH_METHOD_OIDC } from 'api/models/auth-method';
import { TYPE_HOST_CATALOG_PLUGIN_GCP } from 'api/models/host-catalog';

module('Unit | Serializer | application', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('application');
    assert.ok(serializer);
  });

  test('it serializes records', function (assert) {
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('user', {
      name: 'User',
      description: 'Description',
      scope: {
        scope_id: 'global',
        type: 'global',
      },
    });
    const serializedRecord = record.serialize();
    assert.deepEqual(serializedRecord, {
      name: 'User',
      description: 'Description',
      scope_id: 'global',
    });
  });

  test('it serializes scope_id', function (assert) {
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('user', {
      name: 'User',
      description: 'Description',
      scope: {
        scope_id: 'global',
        type: 'global',
      },
    });
    const serializedRecord = record.serialize();
    assert.deepEqual(serializedRecord, {
      name: 'User',
      description: 'Description',
      scope_id: 'global',
    });
  });

  test('it does not serialize scope_id when serializeScopeID is false', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('user');
    const record = store.createRecord('user', {
      name: 'User',
      description: 'Description',
      scope: {
        scope_id: 'global',
        type: 'global',
      },
    });
    const snapshot = record._createSnapshot();
    serializer.serializeScopeID = false;
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      name: 'User',
      description: 'Description',
    });
  });

  test('it serializes empty strings to null', function (assert) {
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('user', {
      name: '',
      description: '',
      version: null,
    });
    let serializedRecord = record.serialize();
    assert.deepEqual(serializedRecord, {
      name: null,
      description: null,
    });
  });

  test('it serializes non-nullish version fields', function (assert) {
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('user', {
      name: 'User',
      description: 'Description',
      version: null,
    });
    let serializedRecord = record.serialize();
    assert.deepEqual(serializedRecord, {
      name: 'User',
      description: 'Description',
    });
    record.version = 1;
    serializedRecord = record.serialize();
    assert.deepEqual(serializedRecord, {
      name: 'User',
      description: 'Description',
      version: 1,
    });
  });

  test('it serializes secret attributes correctly', function (assert) {
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('credential', {
      private_key_passphrase: undefined,
      private_key: null,
      password: '',
      username: 'user',
      credential_store_id: 'csst_i7p1eu0Nw8',
      type: 'username_password',
      name: 'Name',
      description: 'Description',
      version: 1,
    });
    const serializedRecord = record.serialize();
    assert.deepEqual(serializedRecord, {
      attributes: {
        username: 'user',
      },
      credential_store_id: 'csst_i7p1eu0Nw8',
      type: 'username_password',
      name: 'Name',
      description: 'Description',
      version: 1,
    });
  });

  test('it serializes attributes with `for` option containing array or string correctly for non plugins', function (assert) {
    let store = this.owner.lookup('service:store');
    let record = store.createRecord('auth-method', {
      type: TYPE_AUTH_METHOD_OIDC, //has both string and array `for` option
      name: 'OIDC Auth Method',
      state: 'foo',
      account_claim_maps: [{ key: 'foo', value: 'bar' }],
      claims_scopes: [{ value: 'profile' }, { value: 'email' }],
      signing_algorithms: [{ value: 'RS256' }, { value: 'RS384' }],
      allowed_audiences: [
        { value: 'www.alice.com' },
        { value: 'www.alice.com/admin' },
      ],
      idp_ca_certs: [
        { value: 'certificate-1234' },
        { value: 'certificate-5678' },
      ],
      api_url_prefix: 'protocol://host:port/foo',
      client_id: 'id123',
      client_secret: 'secret456',
      disable_discovered_config_validation: true,
      dry_run: true,
      issuer: 'http://www.example.net',
      max_age: 500,
      prompts: [{ value: 'consent' }],
    });

    let serializedRecord = record.serialize();

    assert.deepEqual(serializedRecord, {
      type: TYPE_AUTH_METHOD_OIDC,
      name: 'OIDC Auth Method',
      description: null,
      attributes: {
        account_claim_maps: ['foo=bar'],
        claims_scopes: ['profile', 'email'],
        signing_algorithms: ['RS256', 'RS384'],
        allowed_audiences: ['www.alice.com', 'www.alice.com/admin'],
        idp_ca_certs: ['certificate-1234', 'certificate-5678'],
        api_url_prefix: 'protocol://host:port/foo',
        client_id: 'id123',
        client_secret: 'secret456',
        disable_discovered_config_validation: true,
        dry_run: true,
        issuer: 'http://www.example.net',
        max_age: 500,
        prompts: ['consent'],
      },
    });
  });

  test('it serializes attributes with `for` option containing array or string correctly for plugin types', function (assert) {
    let store = this.owner.lookup('service:store');
    let record = store.createRecord('host-catalog', {
      compositeType: TYPE_HOST_CATALOG_PLUGIN_GCP,
      name: 'GCP plugin',
      description: 'this is a GCP plugin host-catalog',
      disable_credential_rotation: true,
      worker_filter: 'workerfilter',
      access_key_id: 'foobars',
      secret_access_key: 'testing',
      secret_id: 'a1b2c3',
      secret_value: 'a1b2c3',
      role_arn: 'test',
      role_external_id: 'test',
      role_session_name: 'test',
      role_tags: [
        { key: 'Project', value: 'Automation' },
        { key: 'foo', value: 'bar' },
      ],
      project_id: 'project',
      zone: 'zone',
      client_email: 'email',
      target_service_account_id: 'service-account',
      private_key_id: 'key-id',
      private_key: 'key',
    });

    let serializedRecord = record.serialize();
    const expectedResult = {
      name: 'GCP plugin',
      description: 'this is a GCP plugin host-catalog',
      type: 'plugin',
      worker_filter: 'workerfilter',
      attributes: {
        disable_credential_rotation: true,
        project_id: 'project',
        zone: 'zone',
        target_service_account_id: 'service-account',
        client_email: 'email',
      },
      secrets: {
        private_key_id: 'key-id',
        private_key: 'key',
      },
    };
    assert.deepEqual(serializedRecord, expectedResult);
  });

  test('it normalizes array records from an `items` root key', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('user');
    const userModelClass = store.createRecord('user').constructor;
    const payload = {
      items: [
        { id: 1, name: 'User 1', scope: { id: 'o_123' } },
        { id: 2, name: 'User 2', scope: { id: 'o_123' } },
        { id: 3, name: 'User 3', scope: { id: 'o_123' } },
      ],
    };
    const normalizedArray = serializer.normalizeArrayResponse(
      store,
      userModelClass,
      payload,
    );
    assert.deepEqual(normalizedArray, {
      included: [],
      data: [
        {
          id: '1',
          type: 'user',
          attributes: {
            name: 'User 1',
            scope: { id: 'o_123', scope_id: 'o_123' },
          },
          relationships: {},
        },
        {
          id: '2',
          type: 'user',
          attributes: {
            name: 'User 2',
            scope: { id: 'o_123', scope_id: 'o_123' },
          },
          relationships: {},
        },
        {
          id: '3',
          type: 'user',
          attributes: {
            name: 'User 3',
            scope: { id: 'o_123', scope_id: 'o_123' },
          },
          relationships: {},
        },
      ],
    });
  });

  test('it normalizes single, unrooted records', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('user');
    const userModelClass = store.createRecord('user').constructor;
    const payload = {
      id: '1',
      name: 'User 1',
      scope: { id: 'o_123' },
    };
    const normalized = serializer.normalizeSingleResponse(
      store,
      userModelClass,
      payload,
    );
    assert.deepEqual(normalized, {
      included: [],
      data: {
        id: '1',
        type: 'user',
        attributes: {
          authorized_actions: [],
          name: 'User 1',
          account_ids: [],
          scope: { id: 'o_123', scope_id: 'o_123' },
        },
        relationships: {},
      },
    });
  });

  test('it normalizes missing arrays in single responses if annotated in model attributes', function (assert) {
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
          authorized_actions: [],
          aliases: [],
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

  test('it normalizes removed fields correctly', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('user');
    const user = store.createRecord('user').constructor;
    const payload = {
      id: '1',
      name: 'user 1',
      scope: { id: 'o_123' },
    };
    const normalized = serializer.normalizeUpdateRecordResponse(
      store,
      user,
      payload,
    );
    assert.deepEqual(normalized, {
      included: [],
      data: {
        id: '1',
        type: 'user',
        attributes: {
          authorized_actions: [],
          name: 'user 1',
          scope: { id: 'o_123', scope_id: 'o_123' },
          account_ids: [],
          authorized_collection_actions: null,
          created_time: null,
          email: null,
          full_name: null,
          login_name: null,
          updated_time: null,
        },
        relationships: {},
      },
    });
  });

  // JSON values will only be trimmed if the model attr
  // includes the trimWhitespace property set to true
  // See preferred_endpoints attr on host-set model
  test('it trims whitespace on json values', function (assert) {
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('host-set', {
      name: 'Host Set 1',
      compositeType: 'azure',
      description: 'Description',
      host_catalog_id: '123',
      version: 1,
      preferred_endpoints: [{ value: ' option 1' }, { value: 'option 2 ' }],
      sync_interval_seconds: 1,
    });
    assert.deepEqual(record.serialize(), {
      name: 'Host Set 1',
      description: 'Description',
      host_catalog_id: '123',
      version: 1,
      preferred_endpoints: ['option 1', 'option 2'],
      sync_interval_seconds: 1,
      attributes: {},
    });
  });
});
