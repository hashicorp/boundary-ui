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

module('Integration | Helper | decode', function (hooks) {
  setupRenderingTest(hooks);

  test('it decodes and parses the base64 encoded string', async function (assert) {
    const encoded = {
      id: window.btoa(JSON.stringify({ key: 'foo', value: 'bar' })),
    };
    this.set('encodedString', encoded);
    await render(
      hbs`<div data-test>{{get (decode this.encodedString) "value"}}</div>`,
    );
    assert.dom('[data-test]').hasText('bar');
  });

  test('it returns an empty string if the value is undefined', async function (assert) {
    this.set('encodedString', undefined);

    await render(hbs`{{decode this.encodedString}}`);

    assert.strictEqual(this.element.textContent.trim(), '');
  });

  test('it returns an empty string if the value is null', async function (assert) {
    this.set('encodedString', null);

    await render(hbs`{{decode this.encodedString}}`);

    assert.strictEqual(this.element.textContent.trim(), '');
  });
});
