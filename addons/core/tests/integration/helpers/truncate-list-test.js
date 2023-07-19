/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

const list = [
  { key: 1, value: 'boundary' },
  { key: 2, value: 'consul' },
  { key: 3, value: 'packer' },
  { key: 4, value: 'vault' },
];

const listWithNoItem = [];

const listWithOneItem = [{ key: 1, value: 'boundary' }];
module('Integration | Helper | truncate-list', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders correctly', async function (assert) {
    assert.expect(1);
    this.set('inputValue', list);

    await render(hbs`{{truncate-list this.inputValue}}`);
    assert.strictEqual(
      this.element.textContent.trim(),
      'boundary, consul, packer, +1 more'
    );
  });

  test('it renders correctly when there is list with one item', async function (assert) {
    assert.expect(1);
    this.set('inputValue', listWithOneItem);

    await render(hbs`{{truncate-list this.inputValue}}`);
    assert.strictEqual(this.element.textContent.trim(), 'boundary');
  });

  test('it renders correctly when the list is empty', async function (assert) {
    assert.expect(1);
    this.set('inputValue', listWithNoItem);

    await render(hbs`{{truncate-list this.inputValue}}`);
    assert.strictEqual(this.element.textContent.trim(), '');
  });
});
