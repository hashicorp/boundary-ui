import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | host catalog', function (hooks) {
  setupTest(hooks);

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

  test('it normalizes an static host catalog as expected', function (assert) {
    assert.expect(1);
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
      payload
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
        },
        relationships: {},
      },
      included: [],
    });
  });

  test('it normalizes an aws plugin type host catalog as expected', function (assert) {
    assert.expect(1);
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
      payload
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
          plugin: {
            id: 'plugin-id-5',
            name: 'aws',
            description: 'aws host catalog',
          },
          disable_credential_rotation: false,
          region: 'Illinois',
          access_key_id: '0xF3B0a6f8',
          secret_access_key: 'zq{2:IVc8@W^',
        },
        relationships: {},
      },
      included: [],
    });
  });

  test('it normalizes an azure plugin type host catalog as expected', function (assert) {
    assert.expect(1);
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
      payload
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
        },
        relationships: {},
      },
      included: [],
    });
  });
});
