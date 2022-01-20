import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | host catalog', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let serializer = store.serializerFor('host-catalog');

    assert.ok(serializer);
  });

  test('it serializes records', function (assert) {
    let store = this.owner.lookup('service:store');
    let record = store.createRecord('host-catalog', {});

    let serializedRecord = record.serialize();

    assert.ok(serializedRecord);
  });

  test('it serializes a static host-catalog as expected', async function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('host-catalog');
    const record = store.createRecord('host-catalog', {
      name: 'static',
      description: 'this is a static host-catalog',
      type: 'static',
    });
    const snapshot = record._createSnapshot();
    const serializedRecord = serializer.serialize(snapshot);
    const expectedResult = {
      name: 'static',
      description: 'this is a static host-catalog',
      type: 'static',
    };
    assert.deepEqual(serializedRecord, expectedResult);
  });

  test('it serializes an AWS plugin as expected, ignoring read-only and azure fields', async function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('host-catalog');
    const record = store.createRecord('host-catalog', {
      name: 'Aws',
      description: 'this is a Aws plugin host-catalog',
      type: 'plugin',
      plugin: { name: 'aws' }, // Read-only field
      disable_credential_rotation: true,
      tenant_id: 'a1b2c3',
      client_id: 'a1b2c3',
      subscription_id: 'a1b2c3',
      region: 'spain',
      secret_id: 'a1b2c3', // Read-only field
    });
    const snapshot = record._createSnapshot();
    const serializedRecord = serializer.serialize(snapshot);
    const expectedResult = {
      name: 'Aws',
      description: 'this is a Aws plugin host-catalog',
      type: 'plugin',
      attributes: {
        disable_credential_rotation: true,
        tenant_id: 'a1b2c3',
        client_id: 'a1b2c3',
        subscription_id: 'a1b2c3',
      },
    };
    assert.deepEqual(serializedRecord, expectedResult);
  });

  test('it serializes an Azure plugin as expected, ignoring read-only and Aws fields', async function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('host-catalog');
    const record = store.createRecord('host-catalog', {
      name: 'Azure',
      description: 'this is a Azure plugin host-catalog',
      type: 'plugin',
      plugin: { name: 'azure' }, // Read-only field
      disable_credential_rotation: true,
      region: 'spain',
      access_key_id: 'a1b2c3', // Read-only field
    });
    const snapshot = record._createSnapshot();
    const serializedRecord = serializer.serialize(snapshot);
    const expectedResult = {
      name: 'Azure',
      description: 'this is a Azure plugin host-catalog',
      type: 'plugin',
      attributes: {
        disable_credential_rotation: true,
        region: 'spain',
      },
    };
    assert.deepEqual(serializedRecord, expectedResult);
  });
});
