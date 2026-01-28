/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {
  TYPE_HOST_CATALOG_PLUGIN_AWS,
  TYPE_CREDENTIAL_STATIC,
  TYPE_CREDENTIAL_DYNAMIC,
  TYPE_HOST_CATALOG_PLUGIN_GCP,
} from 'api/models/host-catalog';

module('Unit | Serializer | host catalog', function (hooks) {
  setupTest(hooks);

  test('it serializes records', function (assert) {
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('host-catalog', {});

    assert.ok(record.serialize());
  });

  test('it serializes a static host-catalog as expected', async function (assert) {
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('host-catalog', {
      name: 'static',
      description: 'this is a static host-catalog',
      type: 'static',
    });
    const expectedResult = {
      name: 'static',
      description: 'this is a static host-catalog',
      type: 'static',
      attributes: {},
    };
    assert.deepEqual(record.serialize(), expectedResult);
  });

  test('it serializes a new gcp plugin as expected', async function (assert) {
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('host-catalog', {
      compositeType: TYPE_HOST_CATALOG_PLUGIN_GCP,
      name: 'GCP',
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
    const expectedResult = {
      name: 'GCP',
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
    assert.deepEqual(record.serialize(), expectedResult);
  });

  test('it serializes a new aws static plugin as expected', async function (assert) {
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('host-catalog', {
      compositeType: TYPE_HOST_CATALOG_PLUGIN_AWS,
      credentialType: TYPE_CREDENTIAL_STATIC,
      name: 'AWS',
      description: 'this is a Aws plugin host-catalog',
      disable_credential_rotation: true,
      worker_filter: 'workerfilter',
      region: 'west',
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
    });
    const expectedResult = {
      name: 'AWS',
      description: 'this is a Aws plugin host-catalog',
      type: 'plugin',
      worker_filter: 'workerfilter',
      attributes: {
        disable_credential_rotation: true,
        region: 'west',
        role_arn: null,
        role_external_id: null,
        role_session_name: null,
        role_tags: null,
      },
      secrets: {
        access_key_id: 'foobars',
        secret_access_key: 'testing',
      },
    };
    assert.deepEqual(record.serialize(), expectedResult);
  });

  test('it serializes a new aws dynamic credential type plugin as expected', async function (assert) {
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('host-catalog', {
      compositeType: TYPE_HOST_CATALOG_PLUGIN_AWS,
      name: 'AWS',
      credentialType: TYPE_CREDENTIAL_DYNAMIC,
      description: 'this is a Aws plugin host-catalog',
      disable_credential_rotation: true,
      worker_filter: 'workerfilter',
      // these are static AWS fields and should be excluded
      region: 'west',
      access_key_id: 'foobars',
      secret_access_key: 'testing',
      // these are Azure fields and should be excluded
      tenant_id: 'a1b2c3',
      client_id: 'a1b2c3',
      subscription_id: 'a1b2c3',
      secret_id: 'a1b2c3',
      secret_value: 'a1b2c3',
      role_arn: 'test',
      role_external_id: 'test',
      role_session_name: 'test',
      role_tags: [
        { key: 'Project', value: 'Automation' },
        { key: 'foo', value: 'bar' },
      ],
    });
    const expectedResult = {
      name: 'AWS',
      description: 'this is a Aws plugin host-catalog',
      type: 'plugin',
      worker_filter: 'workerfilter',
      attributes: {
        disable_credential_rotation: true,
        region: 'west',
        role_external_id: 'test',
        role_session_name: 'test',
        role_arn: 'test',
        role_tags: { Project: 'Automation', foo: 'bar' },
      },
    };
    assert.deepEqual(record.serialize(), expectedResult);
  });

  test('it serializes a new aws static credential type plugin as expected, ignoring azure and GCP fields', async function (assert) {
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('host-catalog', {
      compositeType: TYPE_HOST_CATALOG_PLUGIN_AWS,
      name: 'AWS',
      credentialType: TYPE_CREDENTIAL_STATIC,
      description: 'this is a Aws plugin host-catalog',
      disable_credential_rotation: true,
      worker_filter: 'workerfilter',
      // these are AWS fields and should be included
      region: 'spain',
      access_key_id: 'foobars',
      secret_access_key: 'testing',
      // these are Azure fields and should be excluded
      tenant_id: 'a1b2c3',
      client_id: 'a1b2c3',
      subscription_id: 'a1b2c3',
      secret_id: 'a1b2c3',
      secret_value: 'a1b2c3',
      project_id: 'project',
      zone: 'zone',
    });
    const expectedResult = {
      name: 'AWS',
      description: 'this is a Aws plugin host-catalog',
      type: 'plugin',
      worker_filter: 'workerfilter',
      attributes: {
        disable_credential_rotation: true,
        region: 'spain',
        role_arn: null,
        role_external_id: null,
        role_session_name: null,
        role_tags: null,
      },
      secrets: {
        access_key_id: 'foobars',
        secret_access_key: 'testing',
      },
    };
    assert.deepEqual(record.serialize(), expectedResult);
  });

  test('it serializes a new azure record as expected, ignoring aws and GCP fields', async function (assert) {
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('host-catalog', {
      compositeType: 'azure',
      name: 'Azure',
      description: 'this is a Azure plugin host-catalog',
      disable_credential_rotation: true,
      region: 'spain',
      access_key_id: 'foobars',
      secret_access_key: 'testing',
      // these are Azure fields and should be excluded
      tenant_id: 'a1b2c3',
      client_id: 'a1b2c3',
      subscription_id: 'a1b2c3',
      secret_id: 'a1b2c3',
      secret_value: 'a1b2c3',
      project_id: 'project',
      zone: 'zone',
      worker_filter: 'workerfilter',
    });
    const expectedResult = {
      name: 'Azure',
      description: 'this is a Azure plugin host-catalog',
      type: 'plugin',
      attributes: {
        disable_credential_rotation: true,
        tenant_id: 'a1b2c3',
        client_id: 'a1b2c3',
        subscription_id: 'a1b2c3',
      },
      secrets: {
        secret_id: 'a1b2c3',
        secret_value: 'a1b2c3',
      },
      worker_filter: 'workerfilter',
    };
    assert.deepEqual(record.serialize(), expectedResult);
  });

  test('it serializes an existing aws record correctly', function (assert) {
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '1',
        type: 'host-catalog',
        credentialType: 'static',
        attributes: {
          type: 'plugin',
          name: 'aws',
          description: 'test description',
          plugin: {
            name: 'aws',
          },
          worker_filter: 'workerfilter',
          region: 'andorra',
        },
      },
    });
    const record = store.peekRecord('host-catalog', '1');
    const expectedResult = {
      type: 'plugin',
      name: 'aws',
      description: 'test description',
      worker_filter: 'workerfilter',
      attributes: {
        disable_credential_rotation: false,
        region: 'andorra',
        role_arn: null,
        role_external_id: null,
        role_session_name: null,
        role_tags: null,
      },
    };
    assert.deepEqual(record.serialize(), expectedResult);
  });

  test('it serializes an existing azure record correctly', function (assert) {
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '2',
        type: 'host-catalog',
        attributes: {
          type: 'plugin',
          name: 'azure',
          description: 'test description',
          plugin: {
            name: 'azure',
          },
          tenant_id: 'a1b2c3',
          client_id: 'foobars12',
          subscription_id: 'barsfoo21',
        },
      },
    });
    const record = store.peekRecord('host-catalog', '2');
    const expectedResult = {
      type: 'plugin',
      name: 'azure',
      description: 'test description',
      worker_filter: null,
      attributes: {
        disable_credential_rotation: false,
        tenant_id: 'a1b2c3',
        client_id: 'foobars12',
        subscription_id: 'barsfoo21',
      },
    };
    assert.deepEqual(record.serialize(), expectedResult);
  });

  test('it normalizes a static host catalog as expected', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('host-catalog');
    const hostCatalog = store.createRecord('host-catalog').constructor;
    const payload = {
      id: '1',
      name: 'Host catalog test',
      description: 'Test description',
      authorized_actions: ['no-op'],
      type: 'static',
    };
    const normalized = serializer.normalizeSingleResponse(
      store,
      hostCatalog,
      payload,
    );
    assert.deepEqual(normalized, {
      data: {
        id: '1',
        type: 'host-catalog',
        attributes: {
          name: 'Host catalog test',
          description: 'Test description',
          authorized_actions: ['no-op'],
          type: 'static',
          access_key_id: null,
          secret_access_key: null,
          secret_id: null,
          secret_value: null,
          private_key_id: null,
          private_key: null,
        },
        relationships: {},
      },
      included: [],
    });
  });

  test('it normalizes an aws plugin type host catalog as expected', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('host-catalog');
    const hostCatalog = store.createRecord('host-catalog').constructor;
    const payload = {
      id: '1',
      name: 'Host catalog test',
      description: 'Test description',
      authorized_actions: ['no-op'],
      type: 'plugin',
      plugin: {
        id: 'plugin-id-5',
        name: 'aws',
        description: 'aws host catalog',
      },
      worker_filter: 'workerfilter',
      attributes: {
        disable_credential_rotation: false,
        region: 'Illinois',
      },
      secrets: {
        access_key_id: '0xF3B0a6f8',
        secret_access_key: 'zq{2:IVc8@W^',
      },
    };
    const normalized = serializer.normalizeSingleResponse(
      store,
      hostCatalog,
      payload,
    );
    assert.deepEqual(normalized, {
      data: {
        id: '1',
        type: 'host-catalog',
        attributes: {
          name: 'Host catalog test',
          type: 'plugin',
          description: 'Test description',
          authorized_actions: ['no-op'],
          worker_filter: 'workerfilter',
          plugin: {
            id: 'plugin-id-5',
            name: 'aws',
            description: 'aws host catalog',
          },
          disable_credential_rotation: false,
          region: 'Illinois',
          access_key_id: '0xF3B0a6f8',
          secret_access_key: 'zq{2:IVc8@W^',
          secret_id: null,
          secret_value: null,
          private_key_id: null,
          private_key: null,
        },
        relationships: {},
      },
      included: [],
    });
  });

  test('it normalizes an azure plugin type host catalog as expected', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('host-catalog');
    const hostCatalog = store.createRecord('host-catalog').constructor;
    const payload = {
      id: '1',
      name: 'Host catalog test',
      description: 'Test description',
      authorized_actions: ['no-op', 'read', 'update', 'delete'],
      type: 'plugin',
      plugin: {
        id: 'plugin-id-6',
        name: 'azure',
        description: 'azure host catalog',
      },
      attributes: {
        disable_credential_rotation: true,
        tenant_id: 'tenant',
        client_id: 'client',
        subscription_id: 'subscription',
      },
      secrets: {
        secret_id: '0xF3B0a6f8',
        secret_value: 'zq{2:IVc8@W^',
      },
    };
    const normalized = serializer.normalizeSingleResponse(
      store,
      hostCatalog,
      payload,
    );
    assert.deepEqual(normalized, {
      data: {
        id: '1',
        type: 'host-catalog',
        attributes: {
          name: 'Host catalog test',
          type: 'plugin',
          description: 'Test description',
          authorized_actions: ['no-op', 'read', 'update', 'delete'],
          plugin: {
            id: 'plugin-id-6',
            name: 'azure',
            description: 'azure host catalog',
          },
          disable_credential_rotation: true,
          secret_id: '0xF3B0a6f8',
          secret_value: 'zq{2:IVc8@W^',
          client_id: 'client',
          tenant_id: 'tenant',
          subscription_id: 'subscription',
          access_key_id: null,
          secret_access_key: null,
          private_key_id: null,
          private_key: null,
        },
        relationships: {},
      },
      included: [],
    });
  });

  test('it normalizes a GCP plugin type host catalog as expected', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('host-catalog');
    const hostCatalog = store.createRecord('host-catalog').constructor;
    const payload = {
      id: '1',
      name: 'Host catalog test',
      description: 'Test description',
      authorized_actions: ['no-op', 'read', 'update', 'delete'],
      type: 'plugin',
      plugin: {
        id: 'plugin-id-7',
        name: 'gcp',
        description: 'gcp host catalog',
      },
      attributes: {
        disable_credential_rotation: true,
        project_id: 'project_id',
        zone: 'zone',
        target_service_account_id: 'target_service_account_id',
      },
      secrets: {
        private_key_id: '0xF3B0a6f8',
        private_key: 'zq{2:IVc8@W^',
      },
    };
    const normalized = serializer.normalizeSingleResponse(
      store,
      hostCatalog,
      payload,
    );
    assert.deepEqual(normalized, {
      data: {
        id: '1',
        type: 'host-catalog',
        attributes: {
          name: 'Host catalog test',
          type: 'plugin',
          description: 'Test description',
          authorized_actions: ['no-op', 'read', 'update', 'delete'],
          plugin: {
            id: 'plugin-id-7',
            name: 'gcp',
            description: 'gcp host catalog',
          },
          disable_credential_rotation: true,
          private_key_id: '0xF3B0a6f8',
          private_key: 'zq{2:IVc8@W^',
          project_id: 'project_id',
          zone: 'zone',
          target_service_account_id: 'target_service_account_id',
          access_key_id: null,
          secret_access_key: null,
          secret_id: null,
          secret_value: null,
        },
        relationships: {},
      },
      included: [],
    });
  });
});
