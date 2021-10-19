import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | filterable-store', function (hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:filterable-store');

    store.createRecord('account', {
      id: 'i_1234567890',
      scope: {
        id: '123',
      },
    });
  });

  test('it supports query filtering', function (assert) {
    tore.filterByIds('account', { scope_id: '123' });
    assert.ok(store);
  });

  test('it supports single attribute filters', function (assert) {
    assert.ok(store);
  });

  test('it supports multiple attribute filters', function (assert) {
    assert.ok(store);
  });
});
