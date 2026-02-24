/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | settings-card/logs', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  const SELECTED_OPTION = 'select option:checked';
  const COPY_BUTTON_TEXT = '.hds-copy-snippet__text';

  test('it renders and selects log levels correctly', async function (assert) {
    const logPath = '/tmp/test.log';
    this.set('model', {
      logLevel: 'info',
      logPath,
    });

    await render(hbs`<SettingsCard::Logs @model={{this.model}} />`);

    assert.dom(SELECTED_OPTION).hasText('Info');
    assert.dom(COPY_BUTTON_TEXT).hasText(logPath);

    this.set('model', {
      logLevel: 'error',
      logPath,
    });
    assert.dom(SELECTED_OPTION).hasText('Error');

    this.set('model', {
      logLevel: 'warn',
      logPath,
    });
    assert.dom(SELECTED_OPTION).hasText('Warn');

    this.set('model', {
      logLevel: 'debug',
      logPath,
    });
    assert.dom(SELECTED_OPTION).hasText('Debug');
  });
});
