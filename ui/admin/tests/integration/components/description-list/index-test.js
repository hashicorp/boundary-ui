/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | description-list', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders with title', async function (assert) {
    await render(hbs`
      <DescriptionList @title="Section Title" as |DL|>
        <DL.Item @label="Label 1">Value 1</DL.Item>
        <DL.Item @label="Label 2">Value 2</DL.Item>
      </DescriptionList>
    `);

    assert.dom('.description-list').exists();
    assert.dom('.description-list-title').exists();
    assert.dom('.description-list-title h3').hasText('Section Title');
  });

  test('it renders without title', async function (assert) {
    await render(hbs`
      <DescriptionList as |DL|>
        <DL.Item @label="Label 1">Value 1</DL.Item>
      </DescriptionList>
    `);

    assert.dom('.description-list').exists();
    assert.dom('.description-list-title').doesNotExist();
  });

  test('it yields Item component correctly', async function (assert) {
    await render(hbs`
      <DescriptionList as |DL|>
        <DL.Item @label="Test Label">Test Value</DL.Item>
      </DescriptionList>
    `);

    assert.dom('.description-list').exists();
    assert.dom('.description-list-item').exists();
    assert.dom('.description-list-item dt').hasText('Test Label');
    assert.dom('.description-list-item dd').hasText('Test Value');
  });

  test('it renders multiple items', async function (assert) {
    await render(hbs`
      <DescriptionList @title="Multiple Items" as |DL|>
        <DL.Item @label="Item 1">Value 1</DL.Item>
        <DL.Item @label="Item 2">Value 2</DL.Item>
        <DL.Item @label="Item 3">Value 3</DL.Item>
      </DescriptionList>
    `);

    assert.dom('.description-list').exists();
    assert.dom('.description-list-item').exists({ count: 3 });
  });

  test('it applies correct CSS classes', async function (assert) {
    await render(hbs`
      <DescriptionList @title="Test" as |DL|>
        <DL.Item @label="Label">Value</DL.Item>
      </DescriptionList>
    `);

    assert.dom('.description-list').exists();
    assert.dom('.description-list').hasClass('description-list');
  });

  test('it renders with complex content in items', async function (assert) {
    await render(hbs`
      <DescriptionList as |DL|>
        <DL.Item @label="Complex Item">
          <div class="test-content">
            <span>Complex</span>
            <strong>Content</strong>
          </div>
        </DL.Item>
      </DescriptionList>
    `);

    assert.dom('.description-list-item dd .test-content').exists();
    assert.dom('.description-list-item dd span').hasText('Complex');
    assert.dom('.description-list-item dd strong').hasText('Content');
  });
});
