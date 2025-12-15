/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, findAll, render, select } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | list-wrapper', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

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
            <F.KeyValue  @options={{this.options}}>
              <:key as |K|>
                <K.text />
              </:key>
              <:value as |V|>
                <V.text />
              </:value>
            </F.KeyValue>
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

  test('it renders multiple options with select and text input as key value pair', async function (assert) {
    this.options = [
      {
        key: 'username_attribute',
        value: 'user',
      },
      {
        key: 'password_attribute',
        value: 'pass',
      },
    ];

    this.selectOptions = ['username_attribute', 'password_attribute'];

    await render(hbs`
        <Form::Field::ListWrapper>
          <:field as |F|>
            <F.KeyValue @name="credential_mapping_overrides">
              <:key as |K|> 
                <K.select @selectOptions={{this.selectOptions}}/>
              </:key>
              <:value as |V|> 
                <V.text/>
              </:value>
            </F.KeyValue>
          </:field>
        </Form::Field::ListWrapper>
    `);

    assert.dom('tbody tr').exists({ count: 1 });
  });

  test('it does not render new rows when the select option limit is reached when showNewRow is passed', async function (assert) {
    this.options = [
      { key: 'username_attribute', value: 'user' },
      { key: 'password_attribute', value: 'pass' },
    ];

    this.selectOptions = ['username_attribute', 'password_attribute'];
    this.showNewRow = () => false;
    await render(hbs`
        <Form::Field::ListWrapper>
          <:field as |F|>
            <F.KeyValue @name="credential_mapping_overrides" @options={{this.options}} @showNewRow={{this.showNewRow}}>
              <:key as |K|> 
                <K.select  @selectOptions={{this.selectOptions}}/>
              </:key>
              <:value as |V|> 
                <V.text/>
              </:value>
            </F.KeyValue>
          </:field>
        </Form::Field::ListWrapper>
    `);

    assert.dom('tbody tr').exists({ count: 2 });
  });

  test('it does render unlimited new rows when @showNewRow is not passed', async function (assert) {
    this.options = [
      {
        key: 'username_attribute',
        value: 'user',
      },
      {
        key: 'password_attribute',
        value: 'pass',
      },
    ];
    this.selectOptions = ['username_attribute', 'password_attribute'];
    await render(hbs`
        <Form::Field::ListWrapper>
          <:field as |F|>
            <F.KeyValue @name="credential_mapping_overrides" @options={{this.options}} >
              <:key as |K|> 
                <K.text/>
              </:key>
              <:value as |V|> 
                <V.text/>
              </:value>
            </F.KeyValue>
          </:field>
        </Form::Field::ListWrapper>
    `);

    assert.dom('tbody tr').exists({ count: 3 });
  });

  test('it renders `newKey` and `newValue` named blocks when passed instead of key and value blocks', async function (assert) {
    this.options = ['option1', 'option2', 'option3'];
    this.selectOptionsNewValue = [
      'username_attribute_new_val',
      'password_attribute_new_val',
    ];

    this.selectOptionsNewKey = [
      'username_attribute_new_key',
      'password_attribute_new_key',
    ];
    await render(hbs`
        <Form::Field::ListWrapper>
          <:field as |F|>
            <F.KeyValue @name="credential_mapping_overrides">
              <:key as |K|> 
                <K.select @selectOptions = {{this.options}}/>
              </:key>
               <:newKey as |N|> 
                <N.select @selectOptions= {{this.selectOptionsNewKey}}/>
              </:newKey>
              <:newValue as |S|> 
                <S.select @selectOptions= {{this.selectOptionsNewValue}}/>
              </:newValue>
              <:value as |V|> 
                <V.select @selectOptions = {{this.options}}/>
              </:value>
            </F.KeyValue>
          </:field>
        </Form::Field::ListWrapper>
    `);

    assert.strictEqual(
      findAll('.list-wrapper-field tbody td:nth-of-type(1) select option')
        .length,
      3,
    );
    assert.strictEqual(
      findAll('.list-wrapper-field tbody td:nth-of-type(2) select option')
        .length,
      3,
    );
  });
});
