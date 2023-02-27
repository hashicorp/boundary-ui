/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | smoke test', function (hooks) {
  setupApplicationTest(hooks);

  test('visiting /smoke', async function (assert) {
    await visit('/smoke');

    assert.deepEqual(currentURL(), '/smoke');
  });
});
