/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'dummy/tests/helpers';

module('Unit | Service | db', function (hooks) {
  setupTest(hooks);

  test('query throws assertion error for unsupported resource type', function (assert) {
    let service = this.owner.lookup('service:db');

    assert.throws(() => {
      service.query('unsupported-type', { query: {} });
    }, /Resource type is not supported/);
  });
});
