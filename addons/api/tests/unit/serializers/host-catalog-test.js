import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | host catalog', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('host-catalog');

    assert.ok(serializer);
  });

  test('it serializes records', function (assert) {
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('host-catalog', {});

    assert.ok(record.serialize());
  });

  test('it serializes a static host-catalog as expected', async function (assert) {
    assert.expect(1);
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
    };
    assert.deepEqual(record.serialize(), expectedResult);
  });

  test('it serializes a new aws plugin as expected, ignoring azure fields', async function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('host-catalog', {
      compositeType: 'aws',
      name: 'AWS',
      description: 'this is a Aws plugin host-catalog',
      disable_credential_rotation: true,
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
    });
    const expectedResult = {
      name: 'AWS',
      description: 'this is a Aws plugin host-catalog',
      type: 'plugin',
      attributes: {
        disable_credential_rotation: true,
        region: 'spain',
      },
      secrets: {
        access_key_id: 'foobars',
        secret_access_key: 'testing',
      },
    };
    assert.deepEqual(record.serialize(), expectedResult);
  });

  test('it serializes a new azure record as expected, ignoring aws fields', async function (assert) {
    assert.expect(1);
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
    };
    assert.deepEqual(record.serialize(), expectedResult);
  });

  test('it serializes an existing aws record correctly', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '1',
        type: 'host-catalog',
        attributes: {
          type: 'plugin',
          name: 'aws',
          description: 'test description',
          plugin: {
            name: 'aws',
          },
          region: 'andorra',
        },
      },
    });
    const record = store.peekRecord('host-catalog', '1');
    const expectedResult = {
      type: 'plugin',
      name: 'aws',
      description: 'test description',
      attributes: {
        disable_credential_rotation: false,
        region: 'andorra',
      },
    };
    assert.deepEqual(record.serialize(), expectedResult);
  });

  test('it serializes an existing azure record correctly', function (assert) {
    assert.expect(1);
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
      attributes: {
        disable_credential_rotation: false,
        tenant_id: 'a1b2c3',
        client_id: 'foobars12',
        subscription_id: 'barsfoo21',
      },
    };
    assert.deepEqual(record.serialize(), expectedResult);
  });
});
