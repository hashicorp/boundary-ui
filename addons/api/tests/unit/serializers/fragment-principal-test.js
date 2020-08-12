import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import FragmentPrincipal from 'api/models/fragment-principal';

module('Unit | Serializer | fragment principal', function(hooks) {
  setupTest(hooks);

  test('it normalizes `id` into `principal_id`', function(assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('fragment-principal');
    const normalized = serializer.normalize(FragmentPrincipal, {
      scope_id: '1',
      principal_id: '2',
      type: 'user'
    });
    assert.deepEqual(normalized, {
      data: {
        attributes: {
          scope_id: '1',
          principal_id: '2',
          type: 'user'
        },
        id: null,
        relationships: {},
        type: 'fragment-principal'
      }
    });
  });
});
