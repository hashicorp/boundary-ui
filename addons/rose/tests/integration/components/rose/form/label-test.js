/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/form/label', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`
      <Rose::Form::Label>
        Form Label
      <//Rose::Form::Label>
    `);
    assert.ok(find('.rose-form-label'));
    assert.strictEqual(
      find('.rose-form-label').textContent.trim(),
      'Form Label',
    );
  });
});
