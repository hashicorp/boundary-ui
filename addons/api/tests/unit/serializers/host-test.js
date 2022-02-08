import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | host', function (hooks) {
  setupTest(hooks);

  test('it serializes host with type static as expected', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('host', {
      name: 'Host 1',
      compositeType: 'static',
      description: 'Description',
      host_catalog_id: '123',
      version: 1,
      address: '188e:68a9:b342:c05c:2595:2f46:499c:759f',
    });
    assert.deepEqual(record.serialize(), {
      name: 'Host 1',
      description: 'Description',
      type: 'static',
      host_catalog_id: '123',
      version: 1,
      attributes: {
        address: '188e:68a9:b342:c05c:2595:2f46:499c:759f',
      },
    });
  });

  test('it serializes host with type plugin as expected', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const recordAws = store.createRecord('host', {
      name: 'Host 2',
      description: 'Description',
      host_catalog_id: '123',
      compositeType: 'aws',
      address: '188e:68a9:b342:c05c:2595:2f46:499c:759f',
    });

    assert.deepEqual(recordAws.serialize(), {
      name: 'Host 2',
      description: 'Description',
      host_catalog_id: '123',
      type: 'plugin',
      attributes: {
        address: '188e:68a9:b342:c05c:2595:2f46:499c:759f',
      },
    });
  });

  test('it normalizes type static record', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('host');
    const host = store.createRecord('host').constructor;
    const payload = {
      id: '1',
      name: 'host test',
      type: 'static',
      ip_addresses: ['10.0.0.1', '10.0.0.2', '10.0.0.3'],
      authorized_actions: ['no-op', 'read'],
      dns_names: ['test.example.internal', 'test.example.external'],
    };
    const normalized = serializer.normalizeSingleResponse(store, host, payload);
    assert.deepEqual(normalized, {
      included: [],
      data: {
        id: '1',
        type: 'host',
        attributes: {
          name: 'host test',
          type: 'static',
          authorized_actions: ['no-op', 'read'],
          dns_names: [
            { value: 'test.example.internal' },
            { value: 'test.example.external' },
          ],
          ip_addresses: [
            { value: '10.0.0.1' },
            { value: '10.0.0.2' },
            { value: '10.0.0.3' },
          ],
        },
        relationships: {},
      },
    });
  });

  test('it normalizes type plugin (aws) record', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('host');
    const host = store.createRecord('host').constructor;
    const payload = {
      id: '1',
      name: 'host test',
      type: 'plugin',
      plugin: {
        name: 'aws',
      },
      ip_addresses: ['10.0.0.1', '10.0.0.2', '10.0.0.3'],
      authorized_actions: ['no-op', 'read'],
      dns_names: ['test.example.internal', 'test.example.external'],
    };
    const normalized = serializer.normalizeSingleResponse(store, host, payload);
    assert.deepEqual(normalized, {
      included: [],
      data: {
        id: '1',
        type: 'host',
        attributes: {
          name: 'host test',
          type: 'plugin',
          authorized_actions: ['no-op', 'read'],
          dns_names: [
            { value: 'test.example.internal' },
            { value: 'test.example.external' },
          ],
          ip_addresses: [
            { value: '10.0.0.1' },
            { value: '10.0.0.2' },
            { value: '10.0.0.3' },
          ],
          plugin: { name: 'aws' },
        },
        relationships: {},
      },
    });
  });
});
