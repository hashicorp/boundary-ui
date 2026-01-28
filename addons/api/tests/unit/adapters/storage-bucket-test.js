/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | storage bucket', function (hooks) {
  setupTest(hooks);

  test('it generates correct createRecord URLs for storage buckets with extra query parameter ?plugin_name', function (assert) {
    const scopeID = 'o_1';
    const mockSnapshot = {
      adapterOptions: {
        scopeID,
      },
      attr() {
        return { name: 'aws_s3' };
      },
    };
    const adapter = this.owner.lookup('adapter:storage-bucket');
    const createRecordURL = adapter.buildURL(
      'storage-bucket',
      null,
      mockSnapshot,
      'createRecord',
    );
    assert.strictEqual(
      createRecordURL,
      '/v1/storage-buckets?plugin_name=aws_s3',
    );
  });
});
