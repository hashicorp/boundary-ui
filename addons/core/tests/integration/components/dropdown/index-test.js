/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render, click, fillIn, findAll, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | dropdown/index', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  const firstItem = {
    id: '1',
    name: 'Project Test',
    displayName: 'Project Test',
  };
  const secondItem = {
    id: '2',
    name: 'Fake Project',
    displayName: 'Fake Project',
  };
  const name = 'test';
  const toggleText = 'Click Me';

  const FIRST_ITEM_SELECTOR = `[data-test-checkbox="${firstItem.id}"]`;
  const SECOND_ITEM_SELECTOR = `[data-test-checkbox="${secondItem.id}"]`;
  const TOGGLE_DROPDOWN_SELECTOR = `[name=${name}] button`;
  const SEARCH_INPUT_SELECTOR = '[data-test-dropdown-search]';
  const COUNT_SELECTOR = `[name=${name}] button div:nth-child(2)`;
  const ITEM_SELECTOR = 'li';

  hooks.beforeEach(function () {
    this.set('name', name);
    this.set('toggleText', toggleText);
    this.set('array', [firstItem, secondItem]);
    this.set('checkedItems', [firstItem.id]);
    this.set('applyFilter', () => {});
  });

  test('it renders', async function (assert) {
    await render(hbs`<Dropdown
  name={{this.name}}
  @toggleText={{this.toggleText}}
  @itemOptions={{this.array}}
  @checkedItems={{this.checkedItems}}
  @applyFilter={{this.applyFilter}}
/>`);
    await click(TOGGLE_DROPDOWN_SELECTOR);

    assert.dom(TOGGLE_DROPDOWN_SELECTOR).includesText(toggleText);
    assert.dom(FIRST_ITEM_SELECTOR).isVisible();
    assert.dom(FIRST_ITEM_SELECTOR).isChecked();
    assert.dom(SECOND_ITEM_SELECTOR).isVisible();

    assert.dom(SEARCH_INPUT_SELECTOR).doesNotExist();
  });

  test('it renders a search input when isSearchable is true', async function (assert) {
    await render(hbs`<Dropdown
  name={{this.name}}
  @toggleText={{this.toggleText}}
  @itemOptions={{this.array}}
  @checkedItems={{this.checkedItems}}
  @applyFilter={{this.applyFilter}}
  @isSearchable={{true}}
/>`);
    await click(TOGGLE_DROPDOWN_SELECTOR);

    assert.dom(SEARCH_INPUT_SELECTOR).exists();
  });

  test('it renders the correct count of checked items', async function (assert) {
    await render(hbs`<Dropdown
  name={{this.name}}
  @toggleText={{this.toggleText}}
  @itemOptions={{this.array}}
  @checkedItems={{this.checkedItems}}
  @applyFilter={{this.applyFilter}}
/>`);

    assert.dom(COUNT_SELECTOR).hasText('1');
  });

  test('it calls applyFilter with the correct arguments', async function (assert) {
    assert.expect(1);
    this.set('applyFilter', (selectedItems) => {
      assert.deepEqual(selectedItems, ['1', '2']);
    });

    await render(hbs`<Dropdown
  name={{this.name}}
  @toggleText={{this.toggleText}}
  @itemOptions={{this.array}}
  @checkedItems={{this.checkedItems}}
  @applyFilter={{this.applyFilter}}
/>`);

    await click(TOGGLE_DROPDOWN_SELECTOR);
    await click(SECOND_ITEM_SELECTOR);
    await click('[data-test-dropdown-apply-button]');
  });

  test('it filters the list of items when searching', async function (assert) {
    this.set('checkedItems', []);

    await render(hbs`<Dropdown
  name={{this.name}}
  @toggleText={{this.toggleText}}
  @itemOptions={{this.array}}
  @checkedItems={{this.checkedItems}}
  @applyFilter={{this.applyFilter}}
  @isSearchable={{true}}
/>`);

    await click(TOGGLE_DROPDOWN_SELECTOR);

    assert.dom(ITEM_SELECTOR).exists({ count: 2 });

    await fillIn(SEARCH_INPUT_SELECTOR, 'fake');

    const result = await waitUntil(() => findAll(ITEM_SELECTOR).length === 1);

    assert.true(result);
  });

  test('it only renders a max of 250 items but allows searching on all items', async function (assert) {
    this.set('checkedItems', []);
    this.set(
      'itemOptions',
      [...Array(600).keys()].map((k) => ({ id: k.toString() })),
    );

    await render(hbs`<Dropdown
  name={{this.name}}
  @toggleText={{this.toggleText}}
  @itemOptions={{this.itemOptions}}
  @checkedItems={{this.checkedItems}}
  @applyFilter={{this.applyFilter}}
  @isSearchable={{true}}
/>`);

    await click(TOGGLE_DROPDOWN_SELECTOR);

    assert.dom(ITEM_SELECTOR).exists({ count: 250 });

    // Random number between 500 and 599 to search
    await fillIn(SEARCH_INPUT_SELECTOR, '591');

    const result = await waitUntil(() => findAll(ITEM_SELECTOR).length === 1);

    assert.true(result);
  });
});
