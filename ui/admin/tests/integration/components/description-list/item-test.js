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
    this.set('label', 'Test Label');
    this.set('value', 'Test Value');

    await render(hbs`
      <DescriptionList::Item @label={{this.label}}>
        {{this.value}}
      </DescriptionList::Item>
    `);

    assert.dom('.description-list-item').exists();
    assert.dom('.description-list-item dt').exists();
    assert.dom('.description-list-item dt').hasText('Test Label');
  });

  test('it renders yielded content (dd)', async function (assert) {
    this.set('label', 'Label');
    this.set('value', 'Test Value Content');

    await render(hbs`
      <DescriptionList::Item @label={{this.label}}>
        {{this.value}}
      </DescriptionList::Item>
    `);

    assert.dom('.description-list-item dd').exists();
    assert.dom('.description-list-item dd').hasText('Test Value Content');
  });

  test('it applies correct structure', async function (assert) {
    this.set('label', 'Structure Test');
    this.set('value', 'Value');

    await render(hbs`
      <DescriptionList::Item @label={{this.label}}>
        {{this.value}}
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
    this.set('label', 'Complex');
    this.set('nestedText', 'Nested Content');

    await render(hbs`
      <DescriptionList::Item @label={{this.label}}>
        <div class="nested">
          <span>{{this.nestedText}}</span>
        </div>
      </DescriptionList::Item>
    `);

    assert.dom('.description-list-item dd .nested').exists();
    assert
      .dom('.description-list-item dd .nested span')
      .hasText('Nested Content');
  });

  test('it renders with empty content', async function (assert) {
    this.set('label', 'Empty');

    await render(hbs`
      <DescriptionList::Item @label={{this.label}}>
      </DescriptionList::Item>
    `);

    assert.dom('.description-list-item').exists();
    assert.dom('.description-list-item dt').hasText('Empty');
    assert.dom('.description-list-item dd').exists();
    assert.dom('.description-list-item dd').hasText('');
  });

  test('it renders with component content', async function (assert) {
    this.set('label', 'With Component');
    this.set('badgeText', 'Active');

    await render(hbs`
      <DescriptionList::Item @label={{this.label}}>
        <Hds::Badge @text={{this.badgeText}} @color="success" />
      </DescriptionList::Item>
    `);

    assert.dom('.description-list-item dd .hds-badge').exists();
    assert.dom('.description-list-item dd .hds-badge').hasText('Active');
  });
});
