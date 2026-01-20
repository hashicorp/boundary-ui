/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Helper | format-time-duration', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('It renders in human-readable duration strings given different durations in milliseconds', async function (assert) {
    // Set mock input (in milliseconds) durations
    this.set('inputDurationSeconds', 3000);
    this.set('inputDurationMinutes', 2700000);
    this.set('inputDurationHours', 5000000);
    this.set('inputDurationDays', 177800000);

    await render(hbs`{{format-time-duration this.inputDurationSeconds}}`);
    assert.dom(this.element).hasText('3s');

    await render(hbs`{{format-time-duration this.inputDurationMinutes}}`);
    assert.dom(this.element).hasText('45m');

    await render(hbs`{{format-time-duration this.inputDurationHours}}`);
    assert.dom(this.element).hasText('1h 23m 20s');

    await render(hbs`{{format-time-duration this.inputDurationDays}}`);
    assert.dom(this.element).hasText('2d 1h 23m 20s');
  });
});
