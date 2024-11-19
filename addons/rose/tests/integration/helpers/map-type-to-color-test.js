/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | map-type-to-color', function (hooks) {
  setupRenderingTest(hooks);

  test('it returns correct color when flash message type is `success`', async function (assert) {
    this.set('inputValue', 'success');

    await render(hbs`{{map-type-to-color this.inputValue}}`);

    assert.dom(this.element).hasText('success');
  });

  test('it returns correct color when flash message type is `error`', async function (assert) {
    this.set('inputValue', 'error');

    await render(hbs`{{map-type-to-color this.inputValue}}`);

    assert.dom(this.element).hasText('critical');
  });

  test('it returns correct color when flash message type is `warning`', async function (assert) {
    this.set('inputValue', 'warning');

    await render(hbs`{{map-type-to-color this.inputValue}}`);

    assert.dom(this.element).hasText('warning');
  });

  test('it returns default color when flash message type does not match', async function (assert) {
    this.set('inputValue', 'other');

    await render(hbs`{{map-type-to-color this.inputValue}}`);

    assert.dom(this.element).hasText('neutral');
  });
});
