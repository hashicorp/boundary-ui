/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | loading-button', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders', async function (assert) {
    await render(hbs`<LoadingButton />`);
    assert.ok(find('.hds-button'));
  });

  test('it executes a function on refresh button click', async function (assert) {
    assert.expect(2);
    this.onClick = () => assert.ok(true, 'refresh was clicked');
    await render(hbs`<LoadingButton @onClick={{this.onClick}} />`);
    assert.ok(find('.hds-button'));
    await click('button');
  });
});
