/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

const list = [
  { key: 1, value: 'boundary' },
  { key: 2, value: 'consul' },
  { key: 3, value: 'packer' },
  { key: 4, value: 'vault' },
];

const listWithNoItem = [];

const listWithOneItem = [{ key: 1, value: 'boundary' }];
const limit = 3;
module('Integration | Helper | truncate-list', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders correctly when there is list with more than the limit specificed', async function (assert) {
    this.set('inputValue', list);
    this.set('limit', limit);
    await render(
      hbs`{{truncate-list 'actions.more' this.inputValue this.limit}}`,
    );
    assert.strictEqual(
      this.element.textContent.trim(),
      'boundary, consul, packer, +1 more',
    );
  });

  test('it renders correctly when there is list with one item', async function (assert) {
    this.set('inputValue', listWithOneItem);

    await render(hbs`{{truncate-list 'actions.more' this.inputValue}}`);
    assert.strictEqual(this.element.textContent.trim(), 'boundary');
  });

  test('it renders correctly when the list is empty', async function (assert) {
    this.set('inputValue', listWithNoItem);

    await render(hbs`{{truncate-list 'actions.more' this.inputValue}}`);
    assert.strictEqual(this.element.textContent.trim(), '');
  });
});
