/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Helper | format-day-year', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders correctly when it is 1 year', async function (assert) {
    this.set('inputValue', 365);
    await render(hbs`{{format-day-year this.inputValue}}`);
    assert.strictEqual(this.element.textContent.trim(), '1 year');
  });

  test('it renders correctly when it is more than 1 year', async function (assert) {
    this.set('inputValue', 730);
    await render(hbs`{{format-day-year this.inputValue}}`);
    assert.strictEqual(this.element.textContent.trim(), '2 years');
  });

  test('it renders correctly when it is not a whole year', async function (assert) {
    this.set('inputValue', 800);
    await render(hbs`{{format-day-year this.inputValue}}`);
    assert.strictEqual(this.element.textContent.trim(), '800 days');
  });
  test('it renders when null', async function (assert) {
    this.set('inputValue', null);
    await render(hbs`{{format-day-year this.inputValue}}`);
    assert.strictEqual(this.element.textContent.trim(), '');
  });
});
