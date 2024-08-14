/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

const CACHE_DAEMON_VERSION = '[data-test-cache-version]';
const ERROR_MESSAGES = '.hds-alert__description > p';
const FIRST_ERROR_MESSAGE = '.hds-alert__description > p:first-child';
const LAST_ERROR_MESSAGE = '.hds-alert__description > p:last-child';

module('Integration | Component | settings-card/application', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('it renders', async function (assert) {
    this.set('model', {
      cacheDaemonErrors: [],
      formattedDesktopVersion: 'v2.0.0',
      formattedCliVersion: 'v3.0.0',
      formattedCacheVersion: 'v4.0.0',
    });
    this.set('toggleTheme', () => {});

    await render(
      hbs`<SettingsCard::Application @model={{this.model}} @toggle={{this.toggleTheme}}/>`,
    );

    assert.dom(this.element).includesText('v2.0.0');
    assert.dom(this.element).includesText('v3.0.0');
    assert.dom(this.element).includesText('v4.0.0');
  });

  test('it renders errors', async function (assert) {
    this.set('model', {
      cacheDaemonErrors: [
        {
          message: `this is a resolvable alias error`,
          name: 'resolvable-alias',
        },
        {
          message: `this is a target error`,
          name: 'target',
        },
      ],
      formattedDesktopVersion: 'v2.0.0',
      formattedCliVersion: 'v3.0.0',
      formattedCacheVersion: 'v4.0.0',
    });
    this.set('toggleTheme', () => {});

    await render(
      hbs`<SettingsCard::Application @model={{this.model}} @toggle={{this.toggleTheme}}/>`,
    );

    assert.dom(ERROR_MESSAGES).isVisible({ count: 2 });
    assert
      .dom(FIRST_ERROR_MESSAGE)
      .hasText('resolvable-alias: this is a resolvable alias error');
    assert.dom(LAST_ERROR_MESSAGE).hasText('target: this is a target error');
  });

  test('it indicates when cache daemon is running', async function (assert) {
    this.set('model', {
      cacheDaemonErrors: [],
      formattedDesktopVersion: 'v2.0.0',
      formattedCliVersion: 'v3.0.0',
      formattedCacheVersion: 'v4.0.0',
    });
    this.set('toggleTheme', () => {});

    await render(
      hbs`<SettingsCard::Application @model={{this.model}} @toggle={{this.toggleTheme}}/>`,
    );

    assert.dom(CACHE_DAEMON_VERSION).hasText('v4.0.0 Running');

    this.set('model', {
      cacheDaemonErrors: [],
      formattedDesktopVersion: 'v2.0.0',
      formattedCliVersion: 'v3.0.0',
      formattedCacheVersion: '',
    });
    assert.dom(CACHE_DAEMON_VERSION).hasText('Not Running');
  });
});
