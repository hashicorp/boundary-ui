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
    await render(hbs`
      <Form::Field::KeyValue>
        <:row as |R|>
          <R.Field as |F|>
            <F.TextInput data-test-key-input @value={{R.rowData.key}} />
          </R.Field>
          <R.Field as |F|>
            <F.TextInput data-test-value-input @value={{R.rowData.value}} />
          </R.Field>
          <R.DeleteRowButton data-test-delete-button @onClick={{R.removeRow}} />
        </:row>
        <:footer as |F|>
          <F.AddRowButton />
        </:footer>
      </Form::Field::KeyValue>
    `);

    assert.dom('[data-test-key-input]').exists();
    assert.dom('[data-test-value-input]').exists();
    assert.dom('[data-test-add-button]').exists();
    assert.dom('[data-test-delete-button]').exists();
  });

  test('it renders with provided data', async function (assert) {
    this.set('data', [
      { key: 'env', value: 'production' },
      { key: 'region', value: 'us-east-1' },
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
          <R.DeleteRowButton data-test-delete-button @onClick={{R.removeRow}} />
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
  });

  test('it renders with legend and helper text', async function (assert) {
    await render(hbs`
      <Form::Field::KeyValue 
        @legend="Test Legend"
        @helperText="Test helper text"
        @isRequired={{true}}
      >
        <:row as |R|>
          <R.Field as |F|>
            <F.TextInput data-test-key-input @value={{R.rowData.key}} />
          </R.Field>
          <R.Field as |F|>
            <F.TextInput data-test-value-input @value={{R.rowData.value}} />
          </R.Field>
          <R.DeleteRowButton data-test-delete-button @onClick={{R.removeRow}} />
        </:row>
        <:footer as |F|>
          <F.AddRowButton />
        </:footer>
      </Form::Field::KeyValue>
    `);

    assert.dom('[data-test-legend]').includesText('Test Legend');
    assert.dom('[data-test-helper-text]').hasText('Test helper text');
  });

  test('it adds new rows', async function (assert) {
    let updatedData = null;
    this.set('onChange', (data) => {
      updatedData = data;
    });

    await render(hbs`
      <Form::Field::KeyValue @onChange={{this.onChange}}>
        <:row as |R|>
          <R.Field as |F|>
            <F.TextInput data-test-key-input @value={{R.rowData.key}} {{on 'input' (fn R.updateAndNotify 'key')}} />
          </R.Field>
          <R.Field as |F|>
            <F.TextInput data-test-value-input @value={{R.rowData.value}} {{on 'input' (fn R.updateAndNotify 'value')}} />
          </R.Field>
          <R.DeleteRowButton data-test-delete-button @onClick={{R.removeRow}} />
        </:row>
        <:footer as |F|>
          <F.AddRowButton />
        </:footer>
      </Form::Field::KeyValue>
    `);

    assert.strictEqual(getKeyInputs().length, 1);

    await click('[data-test-add-button]');

    assert.strictEqual(getKeyInputs().length, 2);
    assert.strictEqual(getValueInputs().length, 2);

    await fillIn(getKeyInputs()[1], 'test-key');

    assert.strictEqual(updatedData.length, 1);
    assert.strictEqual(updatedData[0].key, 'test-key');
  });

  test('it removes rows', async function (assert) {
    let updatedData = null;
    this.set('data', [
      { key: 'key1', value: 'value1' },
      { key: 'key2', value: 'value2' },
    ]);
    this.set('onChange', (data) => {
      updatedData = data;
    });

    await render(hbs`
      <Form::Field::KeyValue @data={{this.data}} @onChange={{this.onChange}}>
        <:row as |R|>
          <R.Field as |F|>
            <F.TextInput data-test-key-input @value={{R.rowData.key}} {{on 'input' (fn R.updateAndNotify 'key')}} />
          </R.Field>
          <R.Field as |F|>
            <F.TextInput data-test-value-input @value={{R.rowData.value}} {{on 'input' (fn R.updateAndNotify 'value')}} />
          </R.Field>
          <R.DeleteRowButton data-test-delete-button @onClick={{R.removeRow}} />
        </:row>
        <:footer as |F|>
          <F.AddRowButton />
        </:footer>
      </Form::Field::KeyValue>
    `);

    assert.strictEqual(getKeyInputs().length, 2);

    await click(getDeleteButtons()[0]);

    assert.strictEqual(getKeyInputs().length, 1);
    assert.strictEqual(updatedData.length, 1);
    assert.dom('[data-test-key-input]').hasValue('key2');
    assert.dom('[data-test-value-input]').hasValue('value2');
  });

  test('it removes one row and replaces with new data', async function (assert) {
    let updatedData = null;
    this.set('data', [{ key: 'key1', value: 'value1' }]);
    this.set('onChange', (data) => {
      updatedData = data;
    });

    await render(hbs`
      <Form::Field::KeyValue @data={{this.data}} @onChange={{this.onChange}}>
        <:row as |R|>
          <R.Field as |F|>
            <F.TextInput data-test-key-input @value={{R.rowData.key}} {{on 'input' (fn R.updateAndNotify 'key')}} />
          </R.Field>
          <R.Field as |F|>
            <F.TextInput data-test-value-input @value={{R.rowData.value}} {{on 'input' (fn R.updateAndNotify 'value')}} />
          </R.Field>
          <R.DeleteRowButton data-test-delete-button @onClick={{R.removeRow}} />
        </:row>
        <:footer as |F|>
          <F.AddRowButton />
        </:footer>
      </Form::Field::KeyValue>
    `);

    assert.strictEqual(getKeyInputs().length, 1);

    // Remove row (component ensures at least one empty row remains)
    await click(getDeleteButtons()[0]);

    // Fill in the new row
    await fillIn('[data-test-key-input]', 'newKey');
    await fillIn('[data-test-value-input]', 'newValue');

    assert.strictEqual(getKeyInputs().length, 1);
    assert.strictEqual(updatedData.length, 1);
    assert.deepEqual(updatedData[0], { key: 'newKey', value: 'newValue' });
  });

  test('it handles text input fields', async function (assert) {
    await render(hbs`
      <Form::Field::KeyValue>
        <:row as |R|>
          <R.Field as |F|>
            <F.TextInput name="test-key" data-test-key-input @value={{R.rowData.key}} />
          </R.Field>
          <R.Field as |F|>
            <F.TextInput name="test-value" data-test-value-input @value={{R.rowData.value}} />
          </R.Field>
          <R.DeleteRowButton data-test-delete-button @onClick={{R.removeRow}} />
        </:row>
        <:footer as |F|>
          <F.AddRowButton />
        </:footer>
      </Form::Field::KeyValue>
    `);

    assert.dom('[data-test-key-input]').hasTagName('input');
    assert.dom('[data-test-key-input]').hasAttribute('type', 'text');
    assert.dom('[data-test-key-input]').hasAttribute('name', 'test-key');
    assert.dom('[data-test-value-input]').hasTagName('input');
    assert.dom('[data-test-value-input]').hasAttribute('type', 'text');
    assert.dom('[data-test-value-input]').hasAttribute('name', 'test-value');
  });

  test('it handles textarea fields', async function (assert) {
    await render(hbs`
      <Form::Field::KeyValue>
        <:row as |R|>
          <R.Field as |F|>
            <F.Textarea name="test-key" data-test-key-input @value={{R.rowData.key}} />
          </R.Field>
          <R.Field as |F|>
            <F.Textarea name="test-value" data-test-value-input @value={{R.rowData.value}} />
          </R.Field>
          <R.DeleteRowButton data-test-delete-button @onClick={{R.removeRow}} />
        </:row>
        <:footer as |F|>
          <F.AddRowButton />
        </:footer>
      </Form::Field::KeyValue>
    `);

    assert.dom('[data-test-key-input]').hasTagName('textarea');
    assert.dom('[data-test-key-input]').hasAttribute('name', 'test-key');
    assert.dom('[data-test-value-input]').hasTagName('textarea');
    assert.dom('[data-test-value-input]').hasAttribute('name', 'test-value');
  });

  test('it supports single field', async function (assert) {
    await render(hbs`
      <Form::Field::KeyValue>
        <:row as |R|>
          <R.Field as |F|>
            <F.TextInput data-test-key-input @value={{R.rowData.key}} />
          </R.Field>
          <R.DeleteRowButton data-test-delete-button @onClick={{R.removeRow}} />
        </:row>
        <:footer as |F|>
          <F.AddRowButton />
        </:footer>
      </Form::Field::KeyValue>
    `);

    assert.dom('[data-test-key-input]').exists();
    assert.dom('[data-test-value-input]').doesNotExist();
    assert.dom('[data-test-add-button]').exists();
    assert.dom('[data-test-delete-button]').exists();
  });

  test('it displays error messages in footer', async function (assert) {
    this.set('errors', [
      { message: 'Key is required' },
      { message: 'Value must be unique' },
    ]);

    await render(hbs`
      <Form::Field::KeyValue @errors={{this.errors}}>
        <:row as |R|>
          <R.Field as |F|>
            <F.TextInput data-test-key-input @value={{R.rowData.key}} />
          </R.Field>
          <R.Field as |F|>
            <F.TextInput data-test-value-input @value={{R.rowData.value}} />
          </R.Field>
          <R.DeleteRowButton data-test-delete-button @onClick={{R.removeRow}} />
        </:row>
        <:footer as |F|>
          <F.AddRowButton />
        </:footer>
      </Form::Field::KeyValue>
    `);

    assert.dom('[data-test-error-message]').exists({ count: 2 });
    assert.dom('[data-test-error-message]').hasText('Key is required');
    assert
      .dom('[data-test-error-message]:nth-child(2)')
      .hasText('Value must be unique');
  });

  test('it does not show error messages when no errors are provided', async function (assert) {
    await render(hbs`
      <Form::Field::KeyValue>
        <:row as |R|>
          <R.Field as |F|>
            <F.TextInput data-test-key-input @value={{R.rowData.key}} />
          </R.Field>
          <R.Field as |F|>
            <F.TextInput data-test-value-input @value={{R.rowData.value}} />
          </R.Field>
          <R.DeleteRowButton data-test-delete-button @onClick={{R.removeRow}} />
        </:row>
        <:footer as |F|>
          <F.AddRowButton />
        </:footer>
      </Form::Field::KeyValue>
    `);

    assert.dom('[data-test-error-message]').doesNotExist();
  });

  test('it updates on input and notifies consumer', async function (assert) {
    let updatedData = null;
    this.set('onChange', (data) => {
      updatedData = data;
    });

    await render(hbs`
      <Form::Field::KeyValue @onChange={{this.onChange}}>
        <:row as |R|>
          <R.Field as |F|>
            <F.TextInput data-test-key-input @value={{R.rowData.key}} {{on 'input' (fn R.updateAndNotify 'key')}} />
          </R.Field>
          <R.Field as |F|>
            <F.TextInput data-test-value-input @value={{R.rowData.value}} {{on 'input' (fn R.updateAndNotify 'value')}} />
          </R.Field>
          <R.DeleteRowButton data-test-delete-button @onClick={{R.removeRow}} />
        </:row>
        <:footer as |F|>
          <F.AddRowButton />
        </:footer>
      </Form::Field::KeyValue>
    `);

    await fillIn('[data-test-key-input]', 'test-key');

    assert.strictEqual(updatedData.length, 1);
    assert.strictEqual(updatedData[0].key, 'test-key');
  });

  test('it filters out rows with empty keys', async function (assert) {
    let updatedData = null;
    this.set('onChange', (data) => {
      updatedData = data;
    });

    await render(hbs`
      <Form::Field::KeyValue @onChange={{this.onChange}}>
        <:row as |R|>
          <R.Field as |F|>
            <F.TextInput data-test-key-input @value={{R.rowData.key}} {{on 'input' (fn R.updateAndNotify 'key')}} />
          </R.Field>
          <R.Field as |F|>
            <F.TextInput data-test-value-input @value={{R.rowData.value}} {{on 'input' (fn R.updateAndNotify 'value')}} />
          </R.Field>
          <R.DeleteRowButton data-test-delete-button @onClick={{R.removeRow}} />
        </:row>
        <:footer as |F|>
          <F.AddRowButton />
        </:footer>
      </Form::Field::KeyValue>
    `);

    await fillIn('[data-test-value-input]', 'test-value');

    // Empty key is filtered out, so no data is sent to parent
    assert.strictEqual(updatedData.length, 0);
  });

  test('it updates both key and value fields', async function (assert) {
    let updatedData = null;
    this.set('onChange', (data) => {
      updatedData = data;
    });

    await render(hbs`
      <Form::Field::KeyValue @onChange={{this.onChange}}>
        <:row as |R|>
          <R.Field as |F|>
            <F.TextInput data-test-key-input @value={{R.rowData.key}} {{on 'input' (fn R.updateAndNotify 'key')}} />
          </R.Field>
          <R.Field as |F|>
            <F.TextInput data-test-value-input @value={{R.rowData.value}} {{on 'input' (fn R.updateAndNotify 'value')}} />
          </R.Field>
          <R.DeleteRowButton data-test-delete-button @onClick={{R.removeRow}} />
        </:row>
        <:footer as |F|>
          <F.AddRowButton />
        </:footer>
      </Form::Field::KeyValue>
    `);

    await fillIn('[data-test-key-input]', 'test-key');
    await fillIn('[data-test-value-input]', 'test-value');

    assert.strictEqual(updatedData.length, 1);
    assert.strictEqual(updatedData[0].key, 'test-key');
    assert.strictEqual(updatedData[0].value, 'test-value');
  });

  test('it hides delete button for empty rows', async function (assert) {
    await render(hbs`
      <Form::Field::KeyValue>
        <:row as |R|>
          <R.Field as |F|>
            <F.TextInput data-test-key-input @value={{R.rowData.key}} {{on 'input' (fn R.updateAndNotify 'key')}} />
          </R.Field>
          <R.Field as |F|>
            <F.TextInput data-test-value-input @value={{R.rowData.value}} {{on 'input' (fn R.updateAndNotify 'value')}} />
          </R.Field>
          {{#if (R.hasData)}}
            <R.DeleteRowButton data-test-delete-button @onClick={{R.removeRow}} />
          {{/if}}
        </:row>
        <:footer as |F|>
          <F.AddRowButton />
        </:footer>
      </Form::Field::KeyValue>
    `);

    // Initially, the row is empty, so delete button should not exist
    assert.dom('[data-test-delete-button]').doesNotExist();

    // Fill in some data
    await fillIn('[data-test-key-input]', 'test-key');

    // Now delete button should appear
    assert.dom('[data-test-delete-button]').exists();

    // Clear the data
    await fillIn('[data-test-key-input]', '');

    // Delete button should be hidden again
    assert.dom('[data-test-delete-button]').doesNotExist();
  });
});
