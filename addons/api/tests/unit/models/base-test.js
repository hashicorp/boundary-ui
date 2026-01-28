/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

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

  test('it may have a scope fragment (and thus a scopeModel)', function (assert) {
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: 'o_1',
        type: 'scope',
      },
    });
    store.push({
      data: {
        id: '123abc',
        type: 'user',
        attributes: {
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const scope = store.peekRecord('scope', 'o_1');
    const model = store.peekRecord('user', '123abc');
    assert.strictEqual(model.scope.scope_id, scope.id);
    assert.strictEqual(model.scopeModel.id, scope.id);
  });

  test('it may accept a `scopeModel` for convenience, instead of a fragment', function (assert) {
    const store = this.owner.lookup('service:store');
    const scope = store.createRecord('scope', { id: 'o_1', type: 'org' });
    const model = store.createRecord('user', '123abc');
    assert.notEqual(model.scopeID, scope.id);
    model.scopeModel = scope;
    assert.strictEqual(model.scopeID, scope.id);
    assert.true(model.scope.isOrg);
  });

  test('it has a displayName attribute', function (assert) {
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'user',
        attributes: {},
      },
    });
    const model = store.peekRecord('user', '123abc');
    assert.strictEqual(model.name, undefined);
    assert.strictEqual(model.displayName, '123abc');
    model.name = 'Test';
    assert.strictEqual(model.displayName, 'Test');
  });

  test('it has canSave and cannotSave attributes', async function (assert) {
    assert.expect(11);
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '1',
        type: 'user',
        attributes: {},
      },
    });
    this.server.patch('users/1', () => {
      assert.ok(true, 'Correctly scoped update record URL was requested.');
      return { id: 1 };
    });
    const model = store.peekRecord('user', '1');
    assert.false(model.canSave);
    assert.true(model.cannotSave);
    // Should be able to save if dirty
    model.name = 'User';

    assert.true(model.hasDirtyAttributes);
    assert.true(model.canSave);
    assert.false(model.cannotSave);

    // Should not be able to save while currently saving
    const savePromise = model.save();

    // Verify conditions before save completes
    assert.true(model.isSaving);
    assert.false(model.canSave);
    assert.true(model.cannotSave);

    // Verify conditions after save completes
    await savePromise;
    assert.false(model.isSaving);
    assert.false(model.canSave);
  });

  test('it saves records to a scoped URL', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('user', { scopeID: 'o_123' });
    this.server.post('users', () => {
      assert.ok(true, 'Correctly scoped create record URL was requested.');
      return { id: 'u_123' };
    });
    await model.save();
    this.server.patch('users/u_123', () => {
      assert.ok(true, 'Correctly scoped update record URL was requested.');
      return { id: 'u_123' };
    });
    await model.save();
    this.server.delete('users/u_123', () => {
      assert.ok(true, 'Correctly scoped delete record URL was requested.');
      return {};
    });
    await model.destroyRecord();
  });

  test('it saves to a custom scoped URL if requested', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const customScopeID = 'global';
    const scope = { scope_id: 'o_123' };
    const model = store.createRecord('user', { scope });
    this.server.post('users', () => {
      assert.ok(true, 'Correctly scoped create record URL was requested.');
      return { id: 'u_123' };
    });
    await model.save({ adapterOptions: { scopeID: customScopeID } });
    this.server.patch('users/u_123', () => {
      assert.ok(true, 'Correctly scoped update record URL was requested.');
      return { id: 'u_123' };
    });
    await model.save({ adapterOptions: { scopeID: customScopeID } });
    this.server.delete('users/u_123', () => {
      assert.ok(true, 'Correctly scoped delete record URL was requested.');
      return {};
    });
    await model.destroyRecord({ adapterOptions: { scopeID: customScopeID } });
  });

  test('it saves records to a URL with a custom method if requested', async function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const method = 'my-custom-method';
    const scope = { scope_id: 'o_123' };
    const model = store.createRecord('user', { scope });
    this.server.post(`users:${method}`, () => {
      assert.ok(true, 'Correctly scoped create record URL was requested.');
      return { id: 'u_123' };
    });
    await model.save({ adapterOptions: { method } });
  });
});
