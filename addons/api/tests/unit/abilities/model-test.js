import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Abilities | Model', function (hooks) {
  setupTest(hooks);

  test('it reflects when a given model may be read based on authorized_actions', function (assert) {
    assert.expect(2);
    const service = this.owner.lookup('service:can');
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('account', {
      authorized_actions: ['read'],
    });
    assert.ok(service.can('read model', model));
    model.authorized_actions = [];
    assert.notOk(service.can('read model', model));
  });

  test('it reflects when a given model may be updated based on authorized_actions', function (assert) {
    assert.expect(2);
    const service = this.owner.lookup('service:can');
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('account', {
      authorized_actions: ['update'],
    });
    assert.ok(service.can('update model', model));
    model.authorized_actions = [];
    assert.notOk(service.can('update model', model));
  });

  test('it reflects when a given model may be deleted based on authorized_actions', function (assert) {
    assert.expect(2);
    const service = this.owner.lookup('service:can');
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('account', {
      authorized_actions: ['delete'],
    });
    assert.ok(service.can('delete model', model));
    model.authorized_actions = [];
    assert.notOk(service.can('delete model', model));
  });
});
