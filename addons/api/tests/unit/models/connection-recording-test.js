/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

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
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('connection-recording', {
      channel_recordings: [store.createRecord('channel-recording')],
    });

    const channel_recordings = await model.channel_recordings;
    assert.strictEqual(channel_recordings.length, 1);
  });
});
