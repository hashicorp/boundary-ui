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
    this.set('title', 'Section Title');
    this.set('label1', 'Label 1');
    this.set('value1', 'Value 1');
    this.set('label2', 'Label 2');
    this.set('value2', 'Value 2');

    await render(hbs`
      <DescriptionList @title={{this.title}} as |DL|>
        <DL.Item @label={{this.label1}}>{{this.value1}}</DL.Item>
        <DL.Item @label={{this.label2}}>{{this.value2}}</DL.Item>
      </DescriptionList>
    `);

    assert.dom('.description-list').exists();
    assert.dom('.description-list-title').exists();
    assert.dom('.description-list-title h3').hasText('Section Title');
  });

  test('it renders without title', async function (assert) {
    this.set('label', 'Label 1');
    this.set('value', 'Value 1');

    await render(hbs`
      <DescriptionList as |DL|>
        <DL.Item @label={{this.label}}>{{this.value}}</DL.Item>
      </DescriptionList>
    `);

    assert.dom('.description-list').exists();
    assert.dom('.description-list-title').doesNotExist();
  });

  test('it yields Item component correctly', async function (assert) {
    this.set('label', 'Test Label');
    this.set('value', 'Test Value');

    await render(hbs`
      <DescriptionList as |DL|>
        <DL.Item @label={{this.label}}>{{this.value}}</DL.Item>
      </DescriptionList>
    `);

    assert.dom('.description-list').exists();
    assert.dom('.description-list-item').exists();
    assert.dom('.description-list-item dt').hasText('Test Label');
    assert.dom('.description-list-item dd').hasText('Test Value');
  });

  test('it renders multiple items', async function (assert) {
    this.set('title', 'Multiple Items');
    this.set('label1', 'Item 1');
    this.set('value1', 'Value 1');
    this.set('label2', 'Item 2');
    this.set('value2', 'Value 2');
    this.set('label3', 'Item 3');
    this.set('value3', 'Value 3');

    await render(hbs`
      <DescriptionList @title={{this.title}} as |DL|>
        <DL.Item @label={{this.label1}}>{{this.value1}}</DL.Item>
        <DL.Item @label={{this.label2}}>{{this.value2}}</DL.Item>
        <DL.Item @label={{this.label3}}>{{this.value3}}</DL.Item>
      </DescriptionList>
    `);

    assert.dom('.description-list').exists();
    assert.dom('.description-list-item').exists({ count: 3 });
  });

  test('it applies correct CSS classes', async function (assert) {
    this.set('title', 'Test');
    this.set('label', 'Label');
    this.set('value', 'Value');

    await render(hbs`
      <DescriptionList @title={{this.title}} as |DL|>
        <DL.Item @label={{this.label}}>{{this.value}}</DL.Item>
      </DescriptionList>
    `);

    assert.dom('.description-list').exists();
    assert.dom('.description-list').hasClass('description-list');
  });

  test('it renders with complex content in items', async function (assert) {
    this.set('label', 'Complex Item');
    this.set('text1', 'Complex');
    this.set('text2', 'Content');

    await render(hbs`
      <DescriptionList as |DL|>
        <DL.Item @label={{this.label}}>
          <div class="test-content">
            <span>{{this.text1}}</span>
            <strong>{{this.text2}}</strong>
          </div>
        </DL.Item>
      </DescriptionList>
    `);

    assert.dom('.description-list-item dd .test-content').exists();
    assert.dom('.description-list-item dd span').hasText('Complex');
    assert.dom('.description-list-item dd strong').hasText('Content');
  });
});
