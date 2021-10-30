import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

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
    selectedItems = [items[2]];
  });

  test('it renders checkboxes equal in length to an array of items', async function (assert) {
    assert.expect(1);
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
    assert.equal(findAll('input').length, 3);
  });

  test.skip('it checks checkboxes for items present in a selectedItems array', async function (assert) {
    assert.expect(1);
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
    assert.equal(findAll(':checked').length, 1);
  });

  test('it fires onChange when items are checked, passing an array of selected items', async function (assert) {
    assert.expect(2);
    this.items = items;
    this.selectedItems = selectedItems;
    this.onChange = (newlySelectedItems) => {
      assert.equal(selectedItems.length, 1);
      assert.equal(newlySelectedItems.length, 2);
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
      assert.equal(selectedItems.length, 1);
      assert.equal(newlySelectedItems.length, 0);
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
