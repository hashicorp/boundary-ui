import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | credential', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('credential', {});
    assert.ok(model);
  });

  test('it has isUsernamePassword property and returns the expected values', async function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('credential', { type: 'username_password' });
    const modelB = store.createRecord('credential', { type: 'ssh_private_key' });

    assert.true(modelA.isUsernamePassword);
    assert.false(modelB.isUsernamePassword);
  });

  test('it has isUnknown property and returns the expected values', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('credential', { type: 'username_password' });
    const modelB = store.createRecord('credential', { type: 'ssh_private_key' });
    const modelC = store.createRecord('credential', { type: 'unknown' });

    assert.false(modelA.isUnknown);
    assert.false(modelB.isUnknown);
    assert.true(modelC.isUnknown);
  });
});
