import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | account', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('account', {});
    assert.ok(model);
  });

  test('it contains attributes', function(assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('account', {
      type: 'password',
      attributes: {
        login_name: 'loginname'
      }
    });
    assert.equal(model.attributes.login_name, 'loginname');
  });
});
