import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | account', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('account', {});
    assert.ok(model);
  });

  test('it has an username attribute for password account', function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    let model = store.createRecord('account', {
      name: 'name',
      type: 'password',
    });
    assert.notOk(model.username);
    model.attributes.login_name = 'username';
    assert.equal(model.username, 'username');
  });
});
