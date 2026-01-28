/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { MIME_TYPE_ASCIICAST } from 'api/models/channel-recording';

module('Unit | Model | channel-recording', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('channel-recording', {});
    assert.ok(model);
  });

  test('it has isAsciicast property and returns the expected values', async function (assert) {
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('channel-recording', {
      mime_types: [MIME_TYPE_ASCIICAST],
    });
    const modelB = store.createRecord('channel-recording', {
      mime_types: ['random'],
    });
    assert.true(modelA.isAsciicast);
    assert.false(modelB.isAsciicast);
  });

  test('it has isAsciicast property and returns the expected values when mime_types are not present', async function (assert) {
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('channel-recording', {
      mime_types: undefined,
    });
    const modelB = store.createRecord('channel-recording', {
      mime_types: [],
    });
    assert.false(modelA.isAsciicast);
    assert.false(modelB.isAsciicast);
  });
});
