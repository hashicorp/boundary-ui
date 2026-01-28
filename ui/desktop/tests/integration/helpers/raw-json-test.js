/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | raw-json', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('inputValue', {});
    await render(hbs`{{raw-json this.inputValue}}`);
    assert.strictEqual(this.element.textContent.trim(), '{}');
    this.set('inputValue', { key: 'value', nestedKey: { key: 'value' } });
    assert.strictEqual(
      this.element.textContent.trim(),
      `{\n  "key": "value",\n  "nestedKey": {\n    "key": "value"\n  }\n}`,
    );
  });
});
