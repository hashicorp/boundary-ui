/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | is-tag-checked', function (hooks) {
  setupRenderingTest(hooks);

  const checkedItems = [
    { key: 'a', value: 'boundary' },
    { key: 'b', value: 'consul' },
    { key: 'c', value: 'packer' },
    { key: 'd', value: 'vault' },
  ];

  test('it returns true when the tag is checked', async function (assert) {
    this.set('checkedItems', checkedItems);
    this.set('tag', { key: 'a', value: 'boundary' });

    await render(
      hbs`{{if (is-tag-checked this.checkedItems this.tag) 'checked' 'not-checked'}}`,
    );

    assert.strictEqual(this.element.textContent.trim(), 'checked');
  });

  test('it returns false when the tag is not checked', async function (assert) {
    this.set('checkedItems', checkedItems);
    this.set('tag', { key: 'a', value: 'vault' });

    await render(
      hbs`{{if (is-tag-checked this.checkedItems this.tag) 'checked' 'not-checked'}}`,
    );

    assert.strictEqual(this.element.textContent.trim(), 'not-checked');
  });

  test('it returns false when item is missing key/value', async function (assert) {
    this.set('checkedItems', checkedItems);
    this.set('tag', { key: null, value: null });

    await render(
      hbs`{{if (is-tag-checked this.checkedItems this.tag) 'checked' 'not-checked'}}`,
    );

    assert.strictEqual(this.element.textContent.trim(), 'not-checked');
  });
});
