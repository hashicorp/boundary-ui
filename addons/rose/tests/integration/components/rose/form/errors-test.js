/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/form/errors', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`
      <Rose::Form::Errors as |errors|>
        <errors.message>An error occurred.</errors.message>
        <errors.message>Another error occurred.</errors.message>
      <//Rose::Form::Errors>
    `);
    assert.ok(find('.rose-form-errors'));
    assert.strictEqual(
      find('.rose-form-error-message:first-child').textContent.trim(),
      'An error occurred.',
    );
    assert.strictEqual(
      find('.rose-form-error-message:last-child').textContent.trim(),
      'Another error occurred.',
    );
  });
});
