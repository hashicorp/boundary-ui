import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TYPE_CHANNEL_SESSION } from 'api/models/channel';

module('Unit | Model | channel', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('channel', {});
    assert.ok(model);
  });

  test('it has isUnknown property and returns the expected values', async function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('channel', {
      type: TYPE_CHANNEL_SESSION,
    });
    const modelB = store.createRecord('channel', {
      type: 'no-such-type',
    });
    assert.false(modelA.isUnknown);
    assert.true(modelB.isUnknown);
  });

  test('it has isSession property and returns the expected values', async function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('channel', {
      type: TYPE_CHANNEL_SESSION,
    });
    const modelB = store.createRecord('channel', {
      type: 'random',
    });
    assert.true(modelA.isSession);
    assert.false(modelB.isSession);
  });
});
