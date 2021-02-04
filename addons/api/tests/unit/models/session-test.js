import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | session', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('session', {});
    assert.ok(model);
    assert.notOk(model.isCancelable);
  });

  test('it allows cancellation of an active session', function(assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('session', {
      status: 'active'
    });
    assert.ok(model.isCancelable);
  });

  test('it allows cancellation of a pending session', function(assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('session', {
      status: 'pending'
    });
    assert.ok(model.isCancelable);
  });

  test('it computes a proxy attribute', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('session');
    assert.equal(model.proxy, null);
    model.setProperties({
      proxy_address: 'localhost',
      proxy_port: '12345'
    });
    assert.equal(model.proxy, 'localhost:12345');
  });
});
