import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | base', function (hooks) {
  setupTest(hooks);

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
        type: 'project',
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
    const model = store.peekRecord('project', '123abc');
    assert.equal(model.scope, scope);
  });

  test('it has a displayName attribute', function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'project',
        attributes: {},
      },
    });
    const model = store.peekRecord('project', '123abc');
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
        type: 'project',
        attributes: {},
      },
    });
    const model = store.peekRecord('project', '1');
    assert.equal(model.canSave, false);
    assert.equal(model.cannotSave, true);
    // Should be able to save if dirty
    model.name = 'Project';
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
});
