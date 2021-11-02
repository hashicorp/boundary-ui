import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | resource-filtering-store', function (hooks) {
  setupTest(hooks);
  let service, store;
  hooks.beforeEach(function () {
    service = this.owner.lookup('service:resource-filtering-store');
    store = this.owner.lookup('service:store');

    store.createRecord('session', {
      id: 's_1',
      scope: {
        id: '123',
      },
    });
  });

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    assert.ok(service);
  });

  // TODO: Is it possible to capture mirage API requests in this test?
  // test('it supports query filters', function (assert) {
  //   const models = service.queryBy('session', {}, { scope_id: '123' });
  //   assert.ok(service);
  // });
});
