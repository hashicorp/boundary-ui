import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Abilities | Account', function (hooks) {
  setupTest(hooks);

  test('it reflects when a given account may set grants based on authorized_actions', function (assert) {
    assert.expect(2);
    const service = this.owner.lookup('service:can');
    const model = {
      authorized_actions: ['set-grants'],
    };
    assert.ok(service.can('setGrants role', model));
    model.authorized_actions = [];
    assert.notOk(service.can('setGrants role', model));
  });
});
