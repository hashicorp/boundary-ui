/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | form/field/key-value', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  // Helper functions
  const getKeyInputs = () => findAll('[data-test-key-input]');
  const getValueInputs = () => findAll('[data-test-value-input]');
  const getDeleteButtons = () => findAll('[data-test-delete-button]');

  test('it renders with default empty row', async function (assert) {
    this.set('data', [{ key: '', value: '' }]);

    await render(hbs`
      <Form::Field::KeyValue @data={{this.data}}>
        <:row as |R|>
          <R.Field as |F|>
            <F.TextInput data-test-key-input @value={{R.rowData.key}} />
          </R.Field>
          <R.Field as |F|>
            <F.TextInput data-test-value-input @value={{R.rowData.value}} />
          </R.Field>
         {{#if R.canDelete}}
            <R.DeleteRowButton data-test-delete-button @onClick={{R.removeRow}} />
          {{/if}}
        </:row>
        <:footer as |F|>
          <F.AddRowButton />
        </:footer>
      </Form::Field::KeyValue>
    `);
    assert.dom('[data-test-key-input]').exists();
    assert.dom('[data-test-value-input]').exists();
    assert.dom('[data-test-add-button]').exists();
    assert.dom('[data-test-delete-button]').doesNotExist();
  });

  test('it renders with provided data', async function (assert) {
    this.set('data', [
      { key: 'env', value: 'production' },
      { key: 'region', value: 'us-east-1' },
    ]);

    await render(hbs`
      <Form::Field::KeyValue 
          @data={{this.data}} 
          @legend="Test Legend"
          @helperText="Test helper text">
        <:row as |R|>
          <R.Field as |F|>
            <F.TextInput data-test-key-input @value={{R.rowData.key}} />
          </R.Field>
          <R.Field as |F|>
            <F.TextInput data-test-value-input @value={{R.rowData.value}} />
          </R.Field>
          {{#if R.canDelete}}
            <R.DeleteRowButton data-test-delete-button @onClick={{R.removeRow}} />
          {{/if}}
        </:row>
        <:footer as |F|>
          <F.AddRowButton />
        </:footer>
      </Form::Field::KeyValue>
    `);

    const keyInputs = getKeyInputs();
    const valueInputs = getValueInputs();

    assert.strictEqual(keyInputs.length, 2);
    assert.strictEqual(valueInputs.length, 2);

    assert.dom(keyInputs[0]).hasValue('env');
    assert.dom(keyInputs[1]).hasValue('region');
    assert.dom(valueInputs[0]).hasValue('production');
    assert.dom(valueInputs[1]).hasValue('us-east-1');
    assert.dom('legend').exists().includesText('Test Legend');
    assert.dom('.hds-form-helper-text ').hasText('Test helper text');
  });

  test('it adds new rows', async function (assert) {
    this.set('data', [{ key: '', value: '' }]);
    this.set('onAdd', () => {
      this.data.push({ key: '', value: '' });
      this.set('data', [...this.data]);
    });
    this.set('onUpdate', (rowData, property, value) => {
      rowData[property] = value;
    });

    await render(hbs`
      <Form::Field::KeyValue @data={{this.data}} @onAdd={{this.onAdd}} @onUpdate={{this.onUpdate}}>
        <:row as |R|>
          <R.Field as |F|>
            <F.TextInput data-test-key-input @value={{R.rowData.key}} {{on 'input' (fn R.updateRow 'key')}} />
          </R.Field>
          <R.Field as |F|>
            <F.TextInput data-test-value-input @value={{R.rowData.value}} {{on 'input' (fn R.updateRow 'value')}} />
          </R.Field>
          {{#if R.canDelete}}
          <R.DeleteRowButton data-test-delete-button @onClick={{R.removeRow}} />
          {{/if}}
        </:row>
        <:footer as |F|>
          <F.AddRowButton />
        </:footer>
      </Form::Field::KeyValue>
    `);

    assert.strictEqual(getKeyInputs().length, 1, 'Initially has one row');

    await click('[data-test-add-button]');

    assert.strictEqual(
      getKeyInputs().length,
      2,
      'After clicking add, has two rows',
    );
    assert.strictEqual(getValueInputs().length, 2);

    // Fill in the second row
    await fillIn(getKeyInputs()[1], 'test-key');
    await fillIn(getValueInputs()[1], 'test-value');

    // Check that the data was updated
    assert.strictEqual(this.data.length, 2);
    assert.strictEqual(this.data[1].key, 'test-key');
    assert.strictEqual(this.data[1].value, 'test-value');
  });

  test('it removes rows', async function (assert) {
    this.set('data', [
      { key: 'key1', value: 'value1' },
      { key: 'key2', value: 'value2' },
    ]);
    this.set('onRemove', (rowData) => {
      // Remove the row from the data array
      let newData = this.data.filter((item) => item !== rowData);
      // Ensure at least one empty row remains
      if (newData.length === 0) {
        newData = [{ key: '', value: '' }];
      }
      this.set('data', newData);
    });

    await render(hbs`
      <Form::Field::KeyValue @data={{this.data}} @onRemove={{this.onRemove}}>
        <:row as |R|>
          <R.Field as |F|>
            <F.TextInput data-test-key-input @value={{R.rowData.key}} {{on 'input' (fn R.updateRow 'key')}} />
          </R.Field>
          <R.Field as |F|>
            <F.TextInput data-test-value-input @value={{R.rowData.value}} {{on 'input' (fn R.updateRow 'value')}} />
          </R.Field>
          {{#if R.canDelete}}
          <R.DeleteRowButton data-test-delete-button @onClick={{R.removeRow}} />
          {{/if}}
          </:row>
        <:footer as |F|>
          <F.AddRowButton />
        </:footer>
      </Form::Field::KeyValue>
    `);

    assert.strictEqual(getKeyInputs().length, 2, 'Initially has two rows');

    // Remove first row
    await click(getDeleteButtons()[0]);

    assert.strictEqual(
      getKeyInputs().length,
      1,
      'After removing first row, has one row',
    );
    assert.dom('[data-test-key-input]').hasValue('key2');
    assert.dom('[data-test-value-input]').hasValue('value2');

    // Remove second row - should ensure at least one empty row remains
    await click(getDeleteButtons()[0]);

    assert.strictEqual(
      getKeyInputs().length,
      1,
      'After removing all rows, still has one empty row',
    );
    assert
      .dom('[data-test-key-input]')
      .hasValue('', 'The remaining row has empty key');
    assert
      .dom('[data-test-value-input]')
      .hasValue('', 'The remaining row has empty value');
  });

  test('it handles different field types', async function (assert) {
    this.set('data', [{ key: 'k', value: 'v' }]);

    // Test TextInput and Select fields
    await render(hbs`
      <Form::Field::KeyValue @data={{this.data}}>
        <:row as |R|>
          <R.Field as |F|>
            <F.TextInput name="test-key" data-test-key-input @value={{R.rowData.key}} />
          </R.Field>
          <R.Field as |F|>
            <F.Select name="test-value" data-test-value-input>
            <option value={{R.rowData.value}} selected />
            </F.Select>
          </R.Field>
          {{#if R.canDelete}}
            <R.DeleteRowButton data-test-delete-button @onClick={{R.removeRow}} />
          {{/if}}
        </:row>
        <:footer as |F|>
          <F.AddRowButton />
        </:footer>
      </Form::Field::KeyValue>
    `);

    assert.dom('[data-test-key-input]').hasValue('k');
    assert.dom('[data-test-value-input]').hasValue('v');

    // Test Textarea field
    await render(hbs`
      <Form::Field::KeyValue @data={{this.data}}>
        <:row as |R|>
          <R.Field as |F|>
            <F.Textarea name="test-key" data-test-key-input @value={{R.rowData.key}} />
          </R.Field>
          {{#if R.canDelete}}
            <R.DeleteRowButton data-test-delete-button @onClick={{R.removeRow}} />
          {{/if}}
        </:row>
        <:footer as |F|>
          <F.AddRowButton />
        </:footer>
      </Form::Field::KeyValue>
    `);

    assert.dom('[data-test-key-input]').hasValue('k');

    // Test single field
    this.set('data', [{ key: '' }]);
    await render(hbs`
      <Form::Field::KeyValue @data={{this.data}}>
        <:row as |R|>
          <R.Field as |F|>
            <F.TextInput data-test-key-input @value={{R.rowData.key}} />
          </R.Field>
          {{#if R.canDelete}}
            <R.DeleteRowButton data-test-delete-button @onClick={{R.removeRow}} />
          {{/if}}
        </:row>
        <:footer as |F|>
          <F.AddRowButton />
        </:footer>
      </Form::Field::KeyValue>
    `);

    assert.dom('[data-test-key-input]').exists();
    assert.dom('[data-test-value-input]').doesNotExist();
    assert.dom('[data-test-add-button]').exists();
    assert.dom('[data-test-delete-button]').doesNotExist();
  });

  test('it displays error messages in footer', async function (assert) {
    this.set('data', [{ key: '', value: '' }]);
    this.set('errors', [
      { message: 'Key is required' },
      { message: 'Value must be unique' },
    ]);

    await render(hbs`
      <Form::Field::KeyValue @data={{this.data}} @errors={{this.errors}}>
        <:row as |R|>
          <R.Field as |F|>
            <F.TextInput data-test-key-input @value={{R.rowData.key}} />
          </R.Field>
          <R.Field as |F|>
            <F.TextInput data-test-value-input @value={{R.rowData.value}} />
          </R.Field>
          {{#if R.canDelete}}
          <R.DeleteRowButton data-test-delete-button @onClick={{R.removeRow}} />
          {{/if}}
        </:row>
        <:footer as |F|>
          <F.AddRowButton />
        </:footer>
      </Form::Field::KeyValue>
    `);

    assert.dom('[data-test-error-message]').exists().hasText('Key is required');
    assert
      .dom('[data-test-error-message]:nth-child(2)')
      .hasText('Value must be unique');
  });

  test('it does not show error messages when no errors are provided', async function (assert) {
    this.set('data', [{ key: '', value: '' }]);

    await render(hbs`
      <Form::Field::KeyValue @data={{this.data}}>
        <:row as |R|>
          <R.Field as |F|>
            <F.TextInput data-test-key-input @value={{R.rowData.key}} />
          </R.Field>
          <R.Field as |F|>
            <F.TextInput data-test-value-input @value={{R.rowData.value}} />
          </R.Field>
          {{#if R.canDelete}}
          <R.DeleteRowButton data-test-delete-button @onClick={{R.removeRow}} />
          {{/if}}
        </:row>
        <:footer as |F|>
          <F.AddRowButton />
        </:footer>
      </Form::Field::KeyValue>
    `);

    assert.dom('[data-test-error-message]').doesNotExist();
  });

  test('it updates both key and value fields', async function (assert) {
    this.set('data', [{ key: '', value: '' }]);
    this.set('onUpdate', (rowData, property, value) => {
      rowData[property] = value;
    });

    await render(hbs`
      <Form::Field::KeyValue @data={{this.data}} @onUpdate={{this.onUpdate}}>
        <:row as |R|>
          <R.Field as |F|>
            <F.TextInput data-test-key-input @value={{R.rowData.key}} {{on 'input' (fn R.updateRow 'key')}} />
          </R.Field>
          <R.Field as |F|>
            <F.TextInput data-test-value-input @value={{R.rowData.value}} {{on 'input' (fn R.updateRow 'value')}} />
          </R.Field>
          {{#if R.canDelete}}
          <R.DeleteRowButton data-test-delete-button @onClick={{R.removeRow}} />
          {{/if}}
        </:row>
        <:footer as |F|>
          <F.AddRowButton />
        </:footer>
      </Form::Field::KeyValue>
    `);

    await fillIn('[data-test-key-input]', 'test-key');
    await fillIn('[data-test-value-input]', 'test-value');

    assert.strictEqual(this.data.length, 1);
    assert.strictEqual(this.data[0].key, 'test-key');
    assert.strictEqual(this.data[0].value, 'test-value');
  });

  test('delete button shows per row based on index and data', async function (assert) {
    this.set('data', [
      { key: '', value: '' },
      { key: '', value: '' },
      { key: 'key3', value: 'value3' },
    ]);

    await render(hbs`
      <Form::Field::KeyValue @data={{this.data}}>
        <:row as |R|>
          <R.Field as |F|>
            <F.TextInput data-test-key-input @value={{R.rowData.key}} />
          </R.Field>
          <R.Field as |F|>
            <F.TextInput data-test-value-input @value={{R.rowData.value}} />
          </R.Field>
          {{#if R.canDelete}}
            <R.DeleteRowButton data-test-delete-button @onClick={{R.removeRow}} />
          {{/if}}
        </:row>
        <:footer as |F|>
          <F.AddRowButton />
        </:footer>
      </Form::Field::KeyValue>
    `);

    assert.strictEqual(getDeleteButtons().length, 3);
  });
});
