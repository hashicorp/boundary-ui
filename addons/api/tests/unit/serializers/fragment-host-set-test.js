import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import FragmentHostSet from 'api/models/fragment-host-set';

module('Unit | Serializer | fragment host set', function(hooks) {
  setupTest(hooks);

  test('it normalizes `id` into `host_set_id`', function(assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('fragment-host-set');
    const normalized = serializer.normalize(FragmentHostSet, {
      id: '2',
      host_catalog_id: '1'
    });
    assert.deepEqual(normalized, {
      data: {
        attributes: {
          host_set_id: '2',
          host_catalog_id: '1'
        },
        id: null,
        relationships: {},
        type: 'fragment-host-set'
      }
    });
  });
});
