/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'desktop/tests/helpers';

module('Unit | Service | client-agent-sessions', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let service = this.owner.lookup('service:client-agent-sessions');
    assert.ok(service);
  });
});
