/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'desktop/tests/helpers';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import {
  TYPE_TARGET_SSH,
  TYPE_TARGET_RDP,
  TYPE_TARGET_TCP,
} from 'api/models/target';

module('Integration | Component | session/proxy-url', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test.each(
    'shows the correct command based on the target type',
    [
      {
        targetType: TYPE_TARGET_SSH,
        expectedCommand: (address, port) => `ssh ${address} -p ${port}`,
        expectedSnippetCount: 1,
      },
      {
        targetType: TYPE_TARGET_RDP,
        expectedCommand: (address, port) => `${address}:${port}`,
        expectedSnippetCount: 2,
      },
      {
        targetType: TYPE_TARGET_TCP,
        expectedCommand: (address, port) => `${address}:${port}`,
        expectedSnippetCount: 2, // TCP has two copy snippets- one for address and one for port
      },
    ],
    async function (
      assert,
      { targetType, expectedCommand, expectedSnippetCount },
    ) {
      this.set('proxyAddress', 'http://localhost');
      this.set('proxyPort', '1234');
      this.set('targetType', targetType);

      await render(
        hbs`
        <Session::ProxyUrl
          @proxyAddress={{this.proxyAddress}}
          @proxyPort={{this.proxyPort}}
          @targetType={{this.targetType}}
        />
      `,
      );
      assert.dom('.hds-copy-snippet').exists({ count: expectedSnippetCount });

      // Assert the content of the copy snippets
      if (targetType === TYPE_TARGET_TCP || targetType === TYPE_TARGET_RDP) {
        assert
          .dom('.hds-copy-snippet:nth-of-type(1)')
          .hasText(this.proxyAddress);
        assert.dom('.hds-copy-snippet:nth-of-type(2)').hasText(this.proxyPort);
      } else {
        assert
          .dom('.hds-copy-snippet')
          .hasText(expectedCommand(this.proxyAddress, this.proxyPort));
      }
    },
  );

  test.each(
    'displays correct dropdown options based on target type',
    [
      {
        targetType: TYPE_TARGET_SSH,
        visibleOptions: [
          '[data-test="ssh-option"]',
          '[data-test="address-port-option"]',
        ],
        hiddenOptions: ['[data-test="rdp-option"]'],
      },
      {
        targetType: TYPE_TARGET_TCP,
        visibleOptions: [
          '[data-test="address-port-option"]',
          '[data-test="ssh-option"]',
        ],
        hiddenOptions: ['[data-test="rdp-option"]'],
      },
    ],
    async function (assert, { targetType, visibleOptions, hiddenOptions }) {
      this.set('proxyAddress', 'http://localhost');
      this.set('proxyPort', '1234');
      this.set('targetType', targetType);

      await render(
        hbs`
        <Session::ProxyUrl
          @proxyAddress={{this.proxyAddress}}
          @proxyPort={{this.proxyPort}}
          @targetType={{this.targetType}}
        />
      `,
      );

      await click('.proxy-url-container .hds-dropdown-toggle-button');

      // Assert visible options
      for (const option of visibleOptions) {
        assert.dom(option).isVisible();
      }

      // Assert hidden options
      for (const option of hiddenOptions) {
        assert.dom(option).doesNotExist();
      }
    },
  );

  test('updates command based on dropdown selection', async function (assert) {
    this.set('proxyAddress', 'http://localhost');
    this.set('proxyPort', '1234');
    this.set('targetType', TYPE_TARGET_SSH);

    await render(
      hbs`
      <Session::ProxyUrl
        @proxyAddress={{this.proxyAddress}}
        @proxyPort={{this.proxyPort}}
        @targetType={{this.targetType}}
      />
    `,
    );

    // select address-port dropdown option
    await click('.proxy-url-container .hds-dropdown-toggle-button');
    await click('[data-test="address-port-option"]');

    assert
      .dom('.hds-copy-snippet:nth-of-type(1)')
      .hasText(`${this.proxyAddress}`);
    assert.dom('.hds-copy-snippet:nth-of-type(2)').hasText(`${this.proxyPort}`);
  });

  test('does not show dropdown for RDP target type', async function (assert) {
    this.set('proxyAddress', 'http://localhost');
    this.set('proxyPort', '1234');
    this.set('targetType', TYPE_TARGET_RDP);

    await render(
      hbs`
      <Session::ProxyUrl
        @proxyAddress={{this.proxyAddress}}
        @proxyPort={{this.proxyPort}}
        @targetType={{this.targetType}}
      />
    `,
    );

    assert.dom('.proxy-url-container .hds-dropdown').doesNotExist();
  });
});
