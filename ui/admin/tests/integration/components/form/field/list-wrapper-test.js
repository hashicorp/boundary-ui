/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | list-wrapper', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('it renders fields', async function (assert) {
    this.error = [
      {
        message: 'Error!',
      },
    ];
    await render(hbs`
    <Form::Field::ListWrapper>
      <:fieldset as |F|>
        <F.Legend>
          Label
        </F.Legend>
        <F.HelperText>
          Help
        </F.HelperText>
        <F.Error as |E|>
          <E.Message>Error!</E.Message>  
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
    this.fn = () => {};

    await render(hbs`
    
    <Form::Field::ListWrapper>
      <:field as |F|>
        <F.TextInput 
          @options={{this.options}}  
          @removeOptionByIndex={{this.fn}}>
        </F.TextInput>
        </:field>
    </Form::Field::ListWrapper>
    `);

    assert
      .dom('.list-wrapper-field [data-test-remove-button]')
      .exists({ count: 2 });

    assert.dom('tbody tr').exists({ count: 3 });
  });
});