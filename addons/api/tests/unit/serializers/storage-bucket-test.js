/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {
  TYPE_STORAGE_BUCKET_PLUGIN_AWS_S3,
  TYPE_STORAGE_BUCKET_PLUGIN,
} from 'api/models/storage-bucket';

module('Unit | Serializer | storage bucket', function (hooks) {
  setupTest(hooks);

  test('it serializes records', function (assert) {
    let store = this.owner.lookup('service:store');
    let record = store.createRecord('storage-bucket', {});

    let serializedRecord = record.serialize();

    assert.ok(serializedRecord);
  });

  test('it serializes a new static aws plugin as expected', async function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('storage-bucket', {
      compositeType: TYPE_STORAGE_BUCKET_PLUGIN_AWS_S3,
      name: 'AWS',
      description: 'this has an aws plugin',
      bucket_name: 'bucketname',
      bucket_prefix: 'bucketprefix',
      worker_filter: 'workerfilter',
      region: 'eu-west-1',
      access_key_id: 'foobars',
      secret_access_key: 'testing',
      disable_credential_rotation: true,
      role_arn: null,
      role_external_id: null,
      role_session_name: null,
      role_tags: null,
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
      },
      secrets: {
        access_key_id: 'foobars',
        secret_access_key: 'testing',
      },
    };
    assert.deepEqual(record.serialize(), expectedResult);
  });

  test('it serializes a new dynamic aws plugin as expected', async function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('storage-bucket', {
      compositeType: TYPE_STORAGE_BUCKET_PLUGIN_AWS_S3,
      name: 'AWS',
      description: 'this has an aws plugin',
      bucket_name: 'bucketname',
      bucket_prefix: 'bucketprefix',
      worker_filter: 'workerfilter',
      region: 'eu-west-1',
      access_key_id: '',
      secret_access_key: '',
      disable_credential_rotation: true,
      role_arn: 'arn',
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
      },
    };
    assert.deepEqual(record.serialize(), expectedResult);
  });
  test('it serializes when updating a storage bucket with static credential correctly', async function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('storage-bucket');
    store.push({
      data: {
        id: '1',
        type: 'storage-bucket',
        attributes: {
          type: TYPE_STORAGE_BUCKET_PLUGIN,
          compositeType: TYPE_STORAGE_BUCKET_PLUGIN_AWS_S3,
          name: 'AWS',
          description: 'this has an aws plugin',
          bucket_name: 'bucketname',
          bucket_prefix: 'bucketprefix',
          worker_filter: 'workerfilter',
          region: 'eu-west-1',
          access_key_id: 'foobars',
          secret_access_key: 'testing',
          disable_credential_rotation: true,
          version: 1,
        },
      },
    });
    const record = store.peekRecord('storage-bucket', '1');
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
      },
      secrets: {
        access_key_id: 'foobars',
        secret_access_key: 'testing',
      },
      version: 1,
    };
    assert.deepEqual(serializedRecord, expectedResult);
  });

  test('it serializes when updating a storage bucket with dynamic credential correctly', async function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('storage-bucket');
    store.push({
      data: {
        id: '1',
        type: 'storage-bucket',
        attributes: {
          type: TYPE_STORAGE_BUCKET_PLUGIN,
          compositeType: TYPE_STORAGE_BUCKET_PLUGIN_AWS_S3,
          name: 'AWS',
          description: 'this has an aws plugin',
          bucket_name: 'bucketname',
          bucket_prefix: 'bucketprefix',
          worker_filter: 'workerfilter',
          region: 'eu-west-1',
          disable_credential_rotation: true,
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
      },
      version: 1,
    };
    assert.deepEqual(serializedRecord, expectedResult);
  });

  test('it normalizes correctly', function (assert) {
    assert.expect(1);
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
      payload
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
