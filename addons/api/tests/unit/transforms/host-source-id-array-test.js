/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Transform | host source id array', function (hooks) {
  setupTest(hooks);

  test('it deserializes an array of strings to an array of `{value}`', function (assert) {
    const transform = this.owner.lookup('transform:host-source-id-array');
    const deserialized = transform.deserialize([
      { id: '123', host_catalog_id: '1' },
    ]);
    assert.deepEqual(deserialized, [
      { host_source_id: '123', host_catalog_id: '1' },
    ]);
  });

  test('it serializes an array of `{value}` to an array of strings', function (assert) {
    const transform = this.owner.lookup('transform:host-source-id-array');
    const serialized = transform.serialize([
      { host_source_id: '123', host_catalog_id: '1' },
    ]);
    assert.deepEqual(serialized, [{ id: '123', host_catalog_id: '1' }]);
  });
});
