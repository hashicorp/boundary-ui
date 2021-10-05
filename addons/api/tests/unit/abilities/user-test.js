import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Abilities | User', function (hooks) {
  setupTest(hooks);

  test('it reflects when a given user resource may add accounts based on authorized_actions', function (assert) {
    assert.expect(2);
    const service = this.owner.lookup('service:can');
    const model = {
      authorized_actions: ['add-accounts'],
    };
    assert.ok(service.can('addAccounts user', model));
    model.authorized_actions = [];
    assert.notOk(service.can('addAccounts user', model));
  });

  test('it reflects when a given user resource may remove accounts based on authorized_actions', function (assert) {
    assert.expect(2);
    const service = this.owner.lookup('service:can');
    const model = {
      authorized_actions: ['remove-accounts'],
    };
    assert.ok(service.can('removeAccounts user', model));
    model.authorized_actions = [];
    assert.notOk(service.can('removeAccounts user', model));
  });
});
