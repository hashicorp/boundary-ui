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
});
