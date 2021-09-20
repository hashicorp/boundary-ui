import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Abilities | Target', function (hooks) {
  setupTest(hooks);

  test('it reflects when a given target may connect based on authorized_actions', function (assert) {
    assert.expect(2);
    const service = this.owner.lookup('service:can');
    const model = {
      authorized_actions: ['authorize-session'],
    };
    assert.ok(service.can('connect target', model));
    model.authorized_actions = [];
    assert.notOk(service.can('connect target', model));
  });
});
