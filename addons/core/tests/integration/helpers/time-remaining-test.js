/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Helper | time-remaining', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it calculates the correct time remainin with less than 24 hours', async function (assert) {
    this.set('expirationTime', new Date(Date.now() + 1000 * 60 * 60 * 24));

    await render(hbs`{{time-remaining this.expirationTime}}`);

    assert.strictEqual(this.element.textContent.trim(), '23:59:59 remaining');
  });

  test('it calculates the correct time remaining with more than 24 hours', async function (assert) {
    this.set('expirationTime', new Date(Date.now() + 1001 * 60 * 60 * 24));

    await render(hbs`{{time-remaining this.expirationTime}}`);

    assert.strictEqual(
      this.element.textContent.trim(),
      '1 day, 0:01:26 remaining',
    );
  });

  test('it calculates the correct time remaining with more than a week', async function (assert) {
    this.set('expirationTime', new Date(Date.now() + 1001 * 60 * 60 * 24 * 8));

    await render(hbs`{{time-remaining this.expirationTime}}`);

    assert.strictEqual(
      this.element.textContent.trim(),
      '1 wk, 1 day, 0:11:31 remaining',
    );
  });

  test('it handles negative time remaining', async function (assert) {
    this.set('expirationTime', new Date(Date.now() - 1000 * 60 * 60 * 24));

    await render(hbs`{{time-remaining this.expirationTime}}`);

    assert.strictEqual(this.element.textContent.trim(), '0:00:00 remaining');
  });
});
