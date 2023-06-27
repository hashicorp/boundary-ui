/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import {
  STATE_SESSION_RECORDING_STARTED,
  STATE_SESSION_RECORDING_AVAILABLE,
  STATE_SESSION_RECORDING_UNKNOWN,
} from 'api/models/session-recording';

module('Integration | Component | session-recording/status', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  const BADGE_ICON_SELECTOR = '.hds-badge__icon svg';
  const BADGE_TEXT_SELECTOR = '.hds-badge__text';

  test('it renders a completed status badge', async function (assert) {
    assert.expect(2);
    this.status = STATE_SESSION_RECORDING_AVAILABLE;

    await render(hbs`
      <SessionRecording::Status @status={{this.status}} />
    `);

    assert
      .dom(BADGE_ICON_SELECTOR)
      .hasAttribute('data-test-icon', 'check-circle');
    assert.dom(BADGE_TEXT_SELECTOR).hasText('Completed');
  });

  test('it renders an in progress status badge', async function (assert) {
    assert.expect(2);
    this.status = STATE_SESSION_RECORDING_STARTED;

    await render(hbs`
      <SessionRecording::Status @status={{this.status}} />
    `);

    assert
      .dom(BADGE_ICON_SELECTOR)
      .hasAttribute('data-test-icon', 'circle-dot');
    assert.dom(BADGE_TEXT_SELECTOR).hasText('Recording');
  });

  test('it renders a failed status badge', async function (assert) {
    assert.expect(2);
    this.status = STATE_SESSION_RECORDING_UNKNOWN;

    await render(hbs`
      <SessionRecording::Status @status={{this.status}} />
    `);

    assert
      .dom(BADGE_ICON_SELECTOR)
      .hasAttribute('data-test-icon', 'alert-triangle');
    assert.dom(BADGE_TEXT_SELECTOR).hasText('Failed');
  });

  test('it renders a failed status badge when the status does not match any known states', async function (assert) {
    assert.expect(2);

    await render(hbs`
      <SessionRecording::Status @status='wat' />
    `);

    assert
      .dom(BADGE_ICON_SELECTOR)
      .hasAttribute('data-test-icon', 'alert-triangle');
    assert.dom(BADGE_TEXT_SELECTOR).hasText('Failed');
  });
});
