import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TYPE_CHANNEL_RECORDING_SESSION } from 'api/models/channel-recording';

module('Unit | Model | channel-recording', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('channel-recording', {});
    assert.ok(model);
  });

  test('it has isUnknown property and returns the expected values', async function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('channel-recording', {
      type: TYPE_CHANNEL_RECORDING_SESSION,
    });
    const modelB = store.createRecord('channel-recording', {
      type: 'no-such-type',
    });
    assert.false(modelA.isUnknown);
    assert.true(modelB.isUnknown);
  });

  test('it has isSession property and returns the expected values', async function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('channel-recording', {
      type: TYPE_CHANNEL_RECORDING_SESSION,
    });
    const modelB = store.createRecord('channel-recording', {
      type: 'random',
    });
    assert.true(modelA.isSession);
    assert.false(modelB.isSession);
  });
});
