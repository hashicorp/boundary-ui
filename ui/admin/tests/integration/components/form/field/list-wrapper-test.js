/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, select } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | list-wrapper', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('it renders fields', async function (assert) {
    this.set('label', 'Label');
    this.set('helperText', 'Help');
    this.set('error', 'Error!');

    await render(hbs`
    <Form::Field::ListWrapper>
      <:fieldset as |F|>
        <F.Legend>
          {{this.label}}
        </F.Legend>
        <F.HelperText>
          {{this.helperText}}
        </F.HelperText>
        <F.Error as |E|>
          <E.Message>{{this.error}}</E.Message>
        </F.Error>
      </:fieldset>
      <:field as |F|>
        <F.KeyValue>
        </F.KeyValue>
        </:field>
    </Form::Field::ListWrapper>
    `);

    assert.dom('tbody tr').exists({ count: 1 });
    assert.dom('legend').exists().hasText('Label');
    assert.dom('.hds-form-helper-text').exists().hasText('Help');

    assert.dom('.hds-form-error__message').exists().hasText('Error!');
    assert.dom('button').exists().hasText('Add');
  });

  test('it renders multiple options with key value pair', async function (assert) {
    this.options = [
      { key: 'one', value: 'two' },
      { key: 'three', value: 'four' },
    ];

    await render(hbs`
        <Form::Field::ListWrapper>
          <:field as |F|>
            <F.KeyValue  @options={{this.options}}></F.KeyValue>
          </:field>
        </Form::Field::ListWrapper>
    `);

    assert.dom('tbody tr').exists({ count: 3 });
  });

  test('it renders multiple options with a single text field', async function (assert) {
    this.options = [{ value: 'one' }, { value: 'three' }];

    await render(hbs`

    <Form::Field::ListWrapper>
      <:field as |F|>
        <F.TextInput
          @options={{this.options}}
        >
        </F.TextInput>
        </:field>
    </Form::Field::ListWrapper>
    `);

    assert
      .dom('.list-wrapper-field [data-test-remove-button]')
      .exists({ count: 2 });

    assert.dom('tbody tr').exists({ count: 3 });
  });

  test('it renders multiple options with a single textarea field', async function (assert) {
    this.options = [{ value: 'one' }, { value: 'three' }];

    await render(hbs`

    <Form::Field::ListWrapper>
      <:field as |F|>
        <F.Textarea
          @options={{this.options}}
        >
        </F.Textarea>
        </:field>
    </Form::Field::ListWrapper>
    `);

    assert
      .dom('.list-wrapper-field [data-test-remove-button]')
      .exists({ count: 2 });

    assert.dom('tbody tr').exists({ count: 3 });
  });

  test('it renders multiple options with a single select field', async function (assert) {
    this.set('options', ['option1', 'option2', 'option3']);
    this.set('model', { select: [{ value: 'option2' }, { value: 'option3' }] });
    await render(hbs`

    <Form::Field::ListWrapper>
      <:field as |F|>
        <F.Select
          @name="select"
          @selectOptions={{this.options}}
          @options={{this.model.select}}
          @model={{this.model}}
          @width='100%'
        />
        </:field>
    </Form::Field::ListWrapper>
    `);

    assert
      .dom(
        `.list-wrapper-field [data-test-remove-option-button=${this.model.select[0].value}]`,
      )
      .exists({ count: 1 });

    assert.dom('tbody tr').exists({ count: 3 });
  });

  test('select field allows you to add and remove options', async function (assert) {
    this.set('options', ['option1', 'option2', 'option3']);
    this.set('model', { select: [{ value: 'option2' }, { value: 'option3' }] });
    await render(hbs`

    <Form::Field::ListWrapper>
      <:field as |F|>
        <F.Select
          @name="select"
          @selectOptions={{this.options}}
          @options={{this.model.select}}
          @model={{this.model}}
          @width='100%'
        />
        </:field>
    </Form::Field::ListWrapper>
    `);

    assert.dom('tbody tr').exists({ count: 3 });

    // Add an option
    await select('.list-wrapper-field tbody tr:last-child select', 'option1');
    await click('.list-wrapper-field [data-test-add-option-button]');
    assert.dom('tbody tr').exists({ count: 4 });

    // Remove an option
    await click('.list-wrapper-field [data-test-remove-option-button=option1]');
    assert.dom('tbody tr').exists({ count: 3 });
  });
});
