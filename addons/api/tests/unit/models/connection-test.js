import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | connection', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('connection', {});
    assert.ok(model);
  });

  test('it has channels as a relationship', async function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('connection', {
      channels: [store.createRecord('channel')],
    });

    const channels = await model.channels;
    assert.strictEqual(channels.length, 1);
  });
});
