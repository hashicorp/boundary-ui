/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/form/checkbox/group', function (hooks) {
  setupRenderingTest(hooks);

  let items;
  let selectedItems;

  hooks.beforeEach(function () {
    items = [
      { id: 1, name: 'Foo' },
      { id: 2, name: 'Bar' },
      { id: 3, name: 'Baz' },
    ];
    // This is the same object reference so === checks will work
    selectedItems = [items[2]];
  });

  test('it renders checkboxes equal in length to an array of items', async function (assert) {
    this.items = items;
    await render(hbs`
      <Rose::Form::Checkbox::Group
        @items={{this.items}}
        as |group|
      >
        <group.checkbox
          @label={{group.item.name}}
          value={{group.item.id}} />
      </Rose::Form::Checkbox::Group>
    `);
    assert.strictEqual(findAll('input').length, 3);
  });

  test('it checks checkboxes for items present in a selectedItems array', async function (assert) {
    this.items = items;
    this.selectedItems = selectedItems;
    await render(hbs`
      <Rose::Form::Checkbox::Group
        @items={{this.items}}
        @selectedItems={{this.selectedItems}}
        as |group|
      >
        <group.checkbox
          @label={{group.item.name}}
          value={{group.item.id}} />
      </Rose::Form::Checkbox::Group>
    `);
    assert.strictEqual(findAll(':checked').length, 1);
  });

  test('it checks checkboxes for objects present in a selectedItems array that are deeply equal', async function (assert) {
    this.items = items;
    this.selectedItems = [{ id: 1, name: 'Foo' }];
    this.isEqual = (item1, item2) =>
      item1.id === item2.id && item1.name === item2.name;
    await render(hbs`
      <Rose::Form::Checkbox::Group
        @items={{this.items}}
        @selectedItems={{this.selectedItems}}
        @itemEqualityFunc={{this.isEqual}}
        as |group|
      >
        <group.checkbox
          @label={{group.item.name}}
          value={{group.item.id}} />
      </Rose::Form::Checkbox::Group>
    `);
    assert.strictEqual(findAll(':checked').length, 1);
  });

  test('it fires onChange when items are checked, passing an array of selected items', async function (assert) {
    assert.expect(2);
    this.items = items;
    this.selectedItems = selectedItems;
    this.onChange = (newlySelectedItems) => {
      assert.strictEqual(selectedItems.length, 1);
      assert.strictEqual(newlySelectedItems.length, 2);
    };
    await render(hbs`
      <Rose::Form::Checkbox::Group
        @items={{this.items}}
        @selectedItems={{this.selectedItems}}
        @onChange={{this.onChange}}
        as |group|
      >
        <group.checkbox
          @label={{group.item.name}}
          value={{group.item.id}} />
      </Rose::Form::Checkbox::Group>
    `);
    await click('.rose-form-checkbox:first-child input');
  });

  test('it fires onChange when items are unchecked, passing an array of selected items', async function (assert) {
    assert.expect(2);
    this.items = items;
    this.selectedItems = selectedItems;
    this.onChange = (newlySelectedItems) => {
      assert.strictEqual(selectedItems.length, 1);
      assert.strictEqual(newlySelectedItems.length, 0);
    };
    await render(hbs`
      <Rose::Form::Checkbox::Group
        @items={{this.items}}
        @selectedItems={{this.selectedItems}}
        @onChange={{this.onChange}}
        as |group|
      >
        <group.checkbox
          @label={{group.item.name}}
          value={{group.item.id}} />
      </Rose::Form::Checkbox::Group>
    `);
    await click('.rose-form-checkbox:last-child input');
  });
});
