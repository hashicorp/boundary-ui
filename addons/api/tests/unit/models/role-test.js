import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | role', function (hooks) {
  setupTest(hooks);

  let model;

  hooks.beforeEach(function () {
    let store = this.owner.lookup('service:store');
    model = store.createRecord('role', {});
  });

  test('it exists', function (assert) {
    assert.ok(model);
  });

  test('it supports name attr', function (assert) {
    model.set('name', 'Role name');
    assert.equal(model.name, 'Role name');
  });

  test('it supports description attr', function (assert) {
    model.set('description', 'Role description');
    assert.equal(model.description, 'Role description');
  });

  test('it supports created time attr', function (assert) {
    const createdTime = new Date();
    model.set('created_time', createdTime);
    assert.equal(model.created_time, createdTime);
  });

  test('it supports updated time attr', function (assert) {
    const updatedTime = new Date();
    model.set('updated_time', updatedTime);
    assert.equal(model.updated_time, updatedTime);
  });

  test('it supports disabled attr', function (assert) {
    assert.notOk(model.disabled);
    model.set('disabled', true);
    assert.ok(model.disabled);
  });
});
