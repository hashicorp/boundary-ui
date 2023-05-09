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

  test('it serializes a new aws plugin as expected', async function (assert) {
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
      secrets_hmac: 'hmac',
      disable_credential_rotation: true,
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
      },
      secrets: {
        access_key_id: 'foobars',
        secret_access_key: 'testing',
      },
    };
    assert.deepEqual(record.serialize(), expectedResult);
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
      secrets_hmac: 'this is secret',
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
          secrets_hmac: 'this is secret',
          region: 'eu-west-1',
          disable_credential_rotation: true,
        },
        type: 'storage-bucket',
        relationships: {},
      },
    });
  });
});
