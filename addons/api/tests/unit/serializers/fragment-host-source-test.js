import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import FragmentHostSource from 'api/models/fragment-host-source';

module('Unit | Serializer | fragment host source', function (hooks) {
  setupTest(hooks);

  test('it normalizes `id` into `host_source_id`', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('fragment-host-source');
    const normalized = serializer.normalize(FragmentHostSource, {
      id: '2',
      host_catalog_id: '1',
    });
    assert.deepEqual(normalized, {
      data: {
        attributes: {
          host_source_id: '2',
          host_catalog_id: '1',
        },
        id: null,
        relationships: {},
        type: 'fragment-host-source',
      },
    });
  });
});
