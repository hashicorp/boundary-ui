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
      user_ids: ['u_anon', 'u_123'],
      group_ids: ['g_456', 'g_789'],
      grants: ['*', '*'],
    });
    assert.equal(model.user_ids.length, 2);
    assert.equal(model.group_ids.length, 2);
    assert.equal(model.grants.length, 2);
  });

});
