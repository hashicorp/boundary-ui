/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

/**
 * This helper takes a value and converts it to a JSON string.
 * It then encodes the string using base64 encoding.
 **/
module('Integration | Helper | encode', function (hooks) {
  setupRenderingTest(hooks);
  test('it encodes a simple object to base64', async function (assert) {
    const input = { foo: 'bar' };
    const jsonString = JSON.stringify(input);
    const base64String = window.btoa(jsonString);
    this.set('input', input);

    await render(hbs`{{encode this.input}}`);
    assert.strictEqual(this.element.textContent.trim(), base64String);
  });

  test('it encodes undefined or null to an empty string', async function (assert) {
    this.set('input', undefined);

    await render(hbs`{{encode this.input}}`);
    assert.strictEqual(this.element.textContent.trim(), '');

    this.set('input', null);

    await render(hbs`{{encode this.input}}`);
    assert.strictEqual(this.element.textContent.trim(), '');
  });
});
