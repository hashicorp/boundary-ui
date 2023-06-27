/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | session recording', function (hooks) {
  setupTest(hooks);

  test('it generates correct URLs for downloading asciicast', function (assert) {
    assert.expect(1);
    const mockSnapshot = {
      adapterOptions: {
        method: 'download',
      },
    };
    const queryObject = {
      mime_type: 'mimeType',
    };
    const adapter = this.owner.lookup('adapter:session-recording');
    const createRecordURL = adapter.buildURL(
      'session-recording',
      'sr_id',
      mockSnapshot,
      'findRecord',
      queryObject
    );
    assert.strictEqual(
      createRecordURL,
      '/v1/session-recordings/sr_id:download?mime_type=mimeType'
    );
  });

  test('it generates correct URLs for retrieving session-recordings', function (assert) {
    assert.expect(1);
    const adapter = this.owner.lookup('adapter:session-recording');
    const createRecordURL = adapter.buildURL(
      'session-recording',
      'sr_id',
      {},
      'findRecord'
    );
    assert.strictEqual(createRecordURL, '/v1/session-recordings/sr_id');
  });
});
