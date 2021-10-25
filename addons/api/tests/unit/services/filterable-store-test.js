import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { Response } from 'miragejs';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Unit | Service | filterable-store', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);
  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:filterable-store');

    store.createRecord('session', {
      id: 'i_1234567890',
      scope: {
        id: '123',
      },
    });
  });

  test('it supports query filtering', function (assert) {
    this.server.get('/v1/sessions?scope_id=123', () => {
      new Response({});
    });
    store.filterByIds('session', { scope_id: '123' });
    assert.ok(store);
  });

  test('it supports single attribute filters', function (assert) {
    assert.ok(store);
  });

  test('it supports multiple attribute filters', function (assert) {
    assert.ok(store);
  });
});
