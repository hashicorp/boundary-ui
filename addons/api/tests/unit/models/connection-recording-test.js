import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | connection-recording', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('connection-recording', {});
    assert.ok(model);
  });

  test('it has channels as a relationship', async function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('connection-recording', {
      channel_recordings: [store.createRecord('channel-recording')],
    });

    const channel_recordings = await model.channel_recordings;
    assert.strictEqual(channel_recordings.length, 1);
  });

  test('it has sortedChannelsByStartTimeDesc property and returns the expected values', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const newestChannel = store.createRecord('channel-recording', {
      start_time: new Date('2023-01-02T00:00:00.999Z'),
    });
    const oldestChannel = store.createRecord('channel-recording', {
      start_time: new Date('2023-01-01T00:00:00.999Z'),
    });
    const model = store.createRecord('connection-recording', {
      channel_recordings: [oldestChannel, newestChannel],
    });

    const sortedChannels = await model.sortedChannelsByStartTimeDesc;
    assert.strictEqual(sortedChannels.length, 2);
    assert.strictEqual(sortedChannels[0].start_time, newestChannel.start_time);
    assert.strictEqual(sortedChannels[1].start_time, oldestChannel.start_time);
  });
});
