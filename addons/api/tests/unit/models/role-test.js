import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | role', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    assert.expect(1);
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('role', {});
    assert.ok(model);
  });

  test('it supports array fields', function (assert) {
    assert.expect(3);
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('role', {
      users: ['u_anon', 'u_123'],
      groups: ['g_456', 'g_789'],
      grants: ['*', '*'],
    });
    assert.equal(model.users.length, 2);
    assert.equal(model.groups.length, 2);
    assert.equal(model.grants.length, 2);
  });

});
