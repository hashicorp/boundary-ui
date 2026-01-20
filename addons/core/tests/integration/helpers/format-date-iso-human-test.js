/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | format-date-iso-human', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('inputValue', new Date('2020-01-01T00:00:00.999Z'));

    await render(hbs`{{format-date-iso-human this.inputValue}}`);

    assert.strictEqual(this.element.textContent.trim(), '2020-01-01 00:00:00');
  });

  test('it renders when null', async function (assert) {
    this.set('inputValue', null);

    await render(hbs`{{format-date-iso-human this.inputValue}}`);

    assert.strictEqual(this.element.textContent.trim(), '');
  });
});
