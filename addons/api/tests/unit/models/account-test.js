import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | account', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('account', {});
    assert.ok(model);
  });

  test('it has an accountName attribute for password account', function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    let model = store.createRecord('account', {
      type: 'password',
    });
    assert.notOk(model.accountName);
    model.attributes.login_name = 'foobar';
    assert.equal(model.accountName, 'foobar');
  });
});
