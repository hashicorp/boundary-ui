/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {
  TYPE_STORAGE_BUCKET_PLUGIN_AWS_S3,
  TYPE_STORAGE_BUCKET_PLUGIN_MINIO,
  TYPE_STORAGE_BUCKET_PLUGIN,
  TYPE_CREDENTIAL_STATIC,
  TYPE_CREDENTIAL_DYNAMIC,
} from 'api/models/storage-bucket';

module('Unit | Serializer | storage bucket', function (hooks) {
  setupTest(hooks);

  test('it serializes a new static aws plugin as expected', async function (assert) {
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('storage-bucket', {
      compositeType: TYPE_STORAGE_BUCKET_PLUGIN_AWS_S3,
      credentialType: TYPE_CREDENTIAL_STATIC,
      name: 'AWS',
      description: 'this has an aws plugin',
      bucket_name: 'bucketname',
      bucket_prefix: 'bucketprefix',
      worker_filter: 'workerfilter',
      region: 'eu-west-1 ',
      access_key_id: 'foobars',
      secret_access_key: 'testing',
      disable_credential_rotation: true,
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
      description: 'this has an aws plugin',
      type: TYPE_STORAGE_BUCKET_PLUGIN,
      bucket_name: 'bucketname',
      bucket_prefix: 'bucketprefix',
      worker_filter: 'workerfilter',
      attributes: {
        region: 'eu-west-1',
        disable_credential_rotation: true,
        role_arn: null,
        role_external_id: null,
        role_session_name: null,
        role_tags: null,
        secrets_hmac: null,
      },
      secrets: {
        access_key_id: 'foobars',
        secret_access_key: 'testing',
      },
    };
    assert.deepEqual(record.serialize(), expectedResult);
  });

  test('it serializes a new minio (static by default) plugin as expected', async function (assert) {
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('storage-bucket', {
      compositeType: TYPE_STORAGE_BUCKET_PLUGIN_MINIO,
      credentialType: TYPE_CREDENTIAL_STATIC,
      name: 'minio',
      description: 'this has a minio plugin',
      bucket_name: 'bucketname',
      bucket_prefix: 'bucketprefix',
      worker_filter: 'workerfilter',
      endpoint_url: 'http://hashicorp.com',
      region: 'eu-west-1',
      access_key_id: 'foobars',
      secret_access_key: 'testing',
      disable_credential_rotation: true,
    });
    const expectedResult = {
      name: 'minio',
      description: 'this has a minio plugin',
      type: TYPE_STORAGE_BUCKET_PLUGIN,
      bucket_name: 'bucketname',
      bucket_prefix: 'bucketprefix',
      worker_filter: 'workerfilter',
      attributes: {
        region: 'eu-west-1',
        disable_credential_rotation: true,
        endpoint_url: 'http://hashicorp.com',
        role_arn: null,
        role_external_id: null,
        role_session_name: null,
        role_tags: null,
        secrets_hmac: null,
      },
      secrets: {
        access_key_id: 'foobars',
        secret_access_key: 'testing',
      },
    };
    assert.deepEqual(record.serialize(), expectedResult);
  });

  test('it serializes a new aws plugin with dynamic credentials as expected', async function (assert) {
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('storage-bucket', {
      compositeType: TYPE_STORAGE_BUCKET_PLUGIN_AWS_S3,
      credentialType: TYPE_CREDENTIAL_DYNAMIC,
      name: 'AWS',
      description: 'this has an aws plugin',
      bucket_name: 'bucketname',
      bucket_prefix: 'bucketprefix',
      worker_filter: 'workerfilter',
      region: 'eu-west-1',
      access_key_id: '',
      secret_access_key: '',
      disable_credential_rotation: true,
      role_arn: 'arn ',
      role_external_id: 'Example987',
      role_session_name: 'my-session',
      role_tags: [
        { key: 'Project', value: 'Automation' },
        { key: 'foo', value: 'bar' },
      ],
    });
    const expectedResult = {
      name: 'AWS',
      description: 'this has an aws plugin',
      type: TYPE_STORAGE_BUCKET_PLUGIN,
      bucket_name: 'bucketname',
      bucket_prefix: 'bucketprefix',
      worker_filter: 'workerfilter',
      attributes: {
        region: 'eu-west-1',
        disable_credential_rotation: true,
        role_arn: 'arn',
        role_external_id: 'Example987',
        role_session_name: 'my-session',
        role_tags: { Project: 'Automation', foo: 'bar' },
        secrets_hmac: null,
      },
    };
    assert.deepEqual(record.serialize(), expectedResult);
  });

  test('it serializes when updating a dynamic type credential storage bucket with static credentials correctly', async function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('storage-bucket');
    store.push({
      data: {
        id: '100',
        type: 'storage-bucket',
        attributes: {
          type: TYPE_STORAGE_BUCKET_PLUGIN,
          name: 'AWS',
          description: 'this has an aws plugin',
          bucket_name: 'bucketname',
          bucket_prefix: 'bucketprefix',
          worker_filter: 'workerfilter',
          plugin: { name: 'aws' },
          region: ' eu-west-1 ',
          access_key_id: 'foobars',
          secret_access_key: 'testing',
          disable_credential_rotation: true,
          version: 1,
          role_arn: ' role_arn_test ',
          role_external_id: 'role_external_id_test',
          role_session_name: 'role_session_test',
          role_tags: [
            { key: 'Project', value: 'Automation' },
            { key: 'foo', value: 'bar' },
          ],
        },
      },
    });
    const record = store.peekRecord('storage-bucket', '100');
    record.credentialType = TYPE_CREDENTIAL_STATIC;
    const snapshot = record._createSnapshot();
    const serializedRecord = serializer.serialize(snapshot);

    const expectedResult = {
      name: 'AWS',
      description: 'this has an aws plugin',
      type: TYPE_STORAGE_BUCKET_PLUGIN,
      worker_filter: 'workerfilter',
      attributes: {
        region: 'eu-west-1',
        disable_credential_rotation: true,
        role_arn: null,
        role_external_id: null,
        role_session_name: null,
        role_tags: null,
        secrets_hmac: null,
      },
      secrets: {
        access_key_id: 'foobars',
        secret_access_key: 'testing',
      },
      version: 1,
    };
    assert.deepEqual(serializedRecord, expectedResult);
  });

  test('it serializes when updating a static type credential storage bucket with dynamic credentials correctly', async function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('storage-bucket');
    store.push({
      data: {
        id: '1',
        type: 'storage-bucket',
        attributes: {
          type: TYPE_STORAGE_BUCKET_PLUGIN,
          name: 'AWS',
          description: 'this has an aws plugin',
          bucket_name: 'bucketname',
          bucket_prefix: 'bucketprefix',
          worker_filter: 'workerfilter',
          plugin: { name: 'aws' },
          region: 'eu-west-1',
          disable_credential_rotation: true,
          access_key_id: 'test',
          secret_access_key: 'test',
          version: 1,
          role_arn: 'arn',
          role_external_id: 'Example987',
          role_session_name: 'my-session',
          role_tags: [
            { key: 'Project', value: 'Automation' },
            { key: 'foo', value: 'bar' },
          ],
        },
      },
    });
    const record = store.peekRecord('storage-bucket', '1');
    record.credentialType = TYPE_CREDENTIAL_DYNAMIC;
    const snapshot = record._createSnapshot();
    const serializedRecord = serializer.serialize(snapshot);

    const expectedResult = {
      name: 'AWS',
      description: 'this has an aws plugin',
      type: TYPE_STORAGE_BUCKET_PLUGIN,
      worker_filter: 'workerfilter',
      attributes: {
        region: 'eu-west-1',
        disable_credential_rotation: true,
        role_arn: 'arn',
        role_external_id: 'Example987',
        role_session_name: 'my-session',
        role_tags: { Project: 'Automation', foo: 'bar' },
        secrets_hmac: null,
      },
      version: 1,
    };
    assert.deepEqual(serializedRecord, expectedResult);
  });

  test('it serializes when updating a MinIO (static credential by default) storage bucket correctly', async function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('storage-bucket');
    store.push({
      data: {
        id: '3',
        type: 'storage-bucket',
        attributes: {
          type: TYPE_STORAGE_BUCKET_PLUGIN,
          plugin: { name: 'minio' },
          name: 'minio',
          description: 'this has a minio plugin',
          bucket_name: 'bucketname',
          bucket_prefix: 'bucketprefix',
          worker_filter: 'workerfilter',
          endpoint_url: 'http://hashicorp.com',
          region: 'eu-west-1',
          disable_credential_rotation: true,
          access_key_id: 'test',
          secret_access_key: 'test',
          version: 1,
        },
      },
    });
    const record = store.peekRecord('storage-bucket', '3');
    record.description = 'This is new description';
    record.name = 'This is the new name';
    record.endpoint_url = 'http://developer.hashicorp.com';
    const snapshot = record._createSnapshot();
    const serializedRecord = serializer.serialize(snapshot);

    const expectedResult = {
      name: 'This is the new name',
      description: 'This is new description',
      type: TYPE_STORAGE_BUCKET_PLUGIN,
      worker_filter: 'workerfilter',
      attributes: {
        region: 'eu-west-1',
        disable_credential_rotation: true,
        endpoint_url: 'http://developer.hashicorp.com',
        role_arn: null,
        role_external_id: null,
        role_session_name: null,
        role_tags: null,
        secrets_hmac: null,
      },
      secrets: {
        access_key_id: 'test',
        secret_access_key: 'test',
      },
      version: 1,
    };
    assert.deepEqual(serializedRecord, expectedResult);
  });

  test('it normalizes correctly', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('storage-bucket');
    const hostSetModelClass = store.createRecord('storage-bucket').constructor;
    const payload = {
      id: '1',
      version: 1,
      name: 'AWS',
      description: 'this has an aws plugin',
      type: TYPE_STORAGE_BUCKET_PLUGIN,
      bucket_name: 'bucketname',
      bucket_prefix: 'bucketprefix',
      worker_filter: 'workerfilter',
      attributes: {
        region: 'eu-west-1',
        disable_credential_rotation: true,
      },
    };
    const normalized = serializer.normalizeSingleResponse(
      store,
      hostSetModelClass,
      payload,
    );

    assert.deepEqual(normalized, {
      included: [],
      data: {
        id: '1',
        attributes: {
          type: TYPE_STORAGE_BUCKET_PLUGIN,
          version: 1,
          authorized_actions: [],
          name: 'AWS',
          description: 'this has an aws plugin',
          bucket_name: 'bucketname',
          bucket_prefix: 'bucketprefix',
          worker_filter: 'workerfilter',
          region: 'eu-west-1',
          disable_credential_rotation: true,
          access_key_id: null,
          secret_access_key: null,
        },
        type: 'storage-bucket',
        relationships: {},
      },
    });
  });
});
