/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'desktop/tests/helpers';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | proxy-url', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('it renders', async function (assert) {
    assert.expect(2);
    this.set('proxyAddress', 'http://localhost');
    this.set('proxyPort', '1234');

    await render(
      hbs`<ProxyUrl @proxyAddress={{this.proxyAddress}} @proxyPort={{this.proxyPort}} />`
    );

    assert.dom('.copy-address').hasText(this.proxyAddress);
    assert.dom('.copy-port').hasText(this.proxyPort);
  });

  test('it switches to SSH command on dropdown click', async function (assert) {
    assert.expect(2);
    this.set('proxyAddress', 'http://localhost');
    this.set('proxyPort', '1234');

    await render(
      hbs`<ProxyUrl @proxyAddress={{this.proxyAddress}} @proxyPort={{this.proxyPort}} />`
    );
    await click('.proxy-url-container .hds-dropdown-toggle-button');
    await click('[data-test-ssh-option]');

    assert.dom('.copy-ssh-command').isVisible();
    assert
      .dom('.copy-ssh-command')
      .hasText(`ssh ${this.proxyAddress} -p ${this.proxyPort}`);
  });
});
