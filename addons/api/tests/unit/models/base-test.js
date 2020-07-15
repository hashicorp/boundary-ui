import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Unit | Model | base', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('base', {});
    assert.ok(model);
  });

  test('it may have a scope relationship', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: 'o_1',
        type: 'scope'
      }
    });
    store.push({
      data: {
        id: '123abc',
        type: 'user',
        attributes: {},
        relationships: {
          scope: {
            data: {
              id: 'o_1',
              type: 'scope'
            }
          }
        }
      }
    });
    const scope = store.peekRecord('scope', 'o_1');
    const model = store.peekRecord('user', '123abc');
    assert.equal(model.scope, scope);
  });

  test('it has a displayName attribute', function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'user',
        attributes: {},
      },
    });
    const model = store.peekRecord('user', '123abc');
    assert.equal(model.name, null);
    assert.equal(model.displayName, '123abc');
    model.name = 'Test';
    assert.equal(model.displayName, 'Test');
  });

  test('it has canSave and cannotSave attributes', function (assert) {
    assert.expect(8);
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '1',
        type: 'user',
        attributes: {},
      },
    });
    const model = store.peekRecord('user', '1');
    assert.equal(model.canSave, false);
    assert.equal(model.cannotSave, true);
    // Should be able to save if dirty
    model.name = 'User';
    assert.equal(model.hasDirtyAttributes, true);
    assert.equal(model.canSave, true);
    assert.equal(model.cannotSave, false);
    // Should not be able to save while currently saving
    model.transitionTo('updated.inFlight');
    assert.equal(model.isSaving, true);
    assert.equal(model.canSave, false);
    assert.equal(model.cannotSave, true);
    model.transitionTo('loaded');
  });

  test('it saves records to a scoped URL', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const scope = store.createRecord('scope', {id: 'o_123'});
    const model = store.createRecord('user', { scope });
    this.server.post('/v1/o_123/users', () => {
      assert.ok(true, 'Correctly scoped create record URL was requested.')
      return {};
    });
    await model.save();
    this.server.patch('/v1/o_123/users', () => {
      assert.ok(true, 'Correctly scoped update record URL was requested.')
      return {};
    });
    await model.save();
    this.server.delete('/v1/o_123/users', () => {
      assert.ok(true, 'Correctly scoped delete record URL was requested.')
      return {};
    });
    await model.destroyRecord();
  });

  test('it saves to a custom scoped URL if requested', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const customScopeID = 'global';
    const scope = store.createRecord('scope', {id: 'o_123'});
    const model = store.createRecord('user', { scope });
    this.server.post('/v1/global/users', () => {
      assert.ok(true, 'Correctly scoped create record URL was requested.')
      return {};
    });
    await model.save({adapterOptions: {scope_id: customScopeID}});
    this.server.patch('/v1/global/users', () => {
      assert.ok(true, 'Correctly scoped update record URL was requested.')
      return {};
    });
    await model.save({adapterOptions: {scope_id: customScopeID}});
    this.server.delete('/v1/global/users', () => {
      assert.ok(true, 'Correctly scoped delete record URL was requested.')
      return {};
    });
    await model.destroyRecord({adapterOptions: {scope_id: customScopeID}});
  });

  test('it saves records to a URL with a custom method if requested', async function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const method = 'my-custom-method';
    const scope = store.createRecord('scope', {id: 'o_123'});
    const model = store.createRecord('user', { scope });
    this.server.post(`/v1/o_123/users:${method}`, () => {
      assert.ok(true, 'Correctly scoped create record URL was requested.')
      return {};
    });
    await model.save({adapterOptions: {method}});
  });
});
