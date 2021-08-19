import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Abilities | Model', function (hooks) {
  setupTest(hooks);

  test('it reflects when a resource may be listed based on authorized_collection_actions', function (assert) {
    assert.expect(2);
    const service = this.owner.lookup('service:can');
    const model = {
      authorized_collection_actions: {
        foobars: ['list'],
      },
    };
    assert.ok(service.can('list collection', model, { collection: 'foobars' }));
    model.authorized_collection_actions = [];
    assert.notOk(
      service.can('list collection', model, { collection: 'foobars' })
    );
  });

  test('it reflects when a resource may be created based on authorized_collection_actions', function (assert) {
    assert.expect(2);
    const service = this.owner.lookup('service:can');
    const model = {
      authorized_collection_actions: {
        foobars: ['create'],
      },
    };
    assert.ok(
      service.can('create collection', model, { collection: 'foobars' })
    );
    model.authorized_collection_actions = [];
    assert.notOk(
      service.can('create collection', model, { collection: 'foobars' })
    );
  });
});
