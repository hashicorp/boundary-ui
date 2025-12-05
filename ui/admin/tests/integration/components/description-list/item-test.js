/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | description-list/item', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders label (dt)', async function (assert) {
    await render(hbs`
      <DescriptionList::Item @label="Test Label">
        Test Value
      </DescriptionList::Item>
    `);

    assert.dom('.description-list-item').exists();
    assert.dom('.description-list-item dt').exists();
    assert.dom('.description-list-item dt').hasText('Test Label');
  });

  test('it renders yielded content (dd)', async function (assert) {
    await render(hbs`
      <DescriptionList::Item @label="Label">
        Test Value Content
      </DescriptionList::Item>
    `);

    assert.dom('.description-list-item dd').exists();
    assert.dom('.description-list-item dd').hasText('Test Value Content');
  });

  test('it applies correct structure', async function (assert) {
    await render(hbs`
      <DescriptionList::Item @label="Structure Test">
        Value
      </DescriptionList::Item>
    `);

    assert.dom('.description-list-item').exists();
    assert.dom('.description-list-item dt').exists();
    assert.dom('.description-list-item dd').exists();
    // dt should come before dd
    const dt = this.element.querySelector('.description-list-item dt');
    const dd = this.element.querySelector('.description-list-item dd');
    assert.ok(
      dt.compareDocumentPosition(dd) & Node.DOCUMENT_POSITION_FOLLOWING,
      'dt should come before dd',
    );
  });

  test('it renders with complex content', async function (assert) {
    await render(hbs`
      <DescriptionList::Item @label="Complex">
        <div class="nested">
          <span>Nested Content</span>
        </div>
      </DescriptionList::Item>
    `);

    assert.dom('.description-list-item dd .nested').exists();
    assert
      .dom('.description-list-item dd .nested span')
      .hasText('Nested Content');
  });

  test('it renders with empty content', async function (assert) {
    await render(hbs`
      <DescriptionList::Item @label="Empty">
      </DescriptionList::Item>
    `);

    assert.dom('.description-list-item').exists();
    assert.dom('.description-list-item dt').hasText('Empty');
    assert.dom('.description-list-item dd').exists();
    assert.dom('.description-list-item dd').hasText('');
  });

  test('it renders with component content', async function (assert) {
    await render(hbs`
      <DescriptionList::Item @label="With Component">
        <Hds::Badge @text="Active" @color="success" />
      </DescriptionList::Item>
    `);

    assert.dom('.description-list-item dd .hds-badge').exists();
    assert.dom('.description-list-item dd .hds-badge').hasText('Active');
  });
});
