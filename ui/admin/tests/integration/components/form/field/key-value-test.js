/**
 * Copyright IBM Corp. 2021, 2026
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

  // Test selectors
  const KEY_INPUT = '[data-test-key-input]';
  const VALUE_INPUT = '[data-test-value-input]';
  const DELETE_BUTTON = '[data-test-delete-button]';
  const ADD_BUTTON = '[data-test-add-button]';
  const ERROR_MESSAGE = '[data-test-error-message]';

  // Helper functions
  const getKeyInputs = () => findAll(KEY_INPUT);
  const getValueInputs = () => findAll(VALUE_INPUT);
  const getDeleteButtons = () => findAll(DELETE_BUTTON);

  test('it renders with default and provided data', async function (assert) {
    // Default empty row
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
    assert.dom(KEY_INPUT).exists();
    assert.dom(VALUE_INPUT).exists();
    assert.dom(ADD_BUTTON).exists();
    assert.dom(DELETE_BUTTON).doesNotExist();

    // Provided data
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

  test('it adds new rows using custom handlers', async function (assert) {
    this.set('data', [{ key: '', value: '' }]);
    this.set('onAdd', () => {
      this.data.push({ key: '', value: '' });
      this.set('data', [...this.data]);
    });
    this.set('onUpdate', (rowData, property, { target: { value } }) => {
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

    await click(ADD_BUTTON);

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

  test('it handles different field types', async function (assert) {
    this.set('data', [{ key: 'k', value: 'v', id: 1 }]);

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
          <R.Field as |F|>
            <F.TextInput name="test-id" data-test-id-input @value={{R.rowData.id}} />
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

    assert.dom(KEY_INPUT).hasValue('k');
    assert.dom(VALUE_INPUT).hasValue('v');
    assert.dom('[data-test-id-input]').hasValue('1');

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

    assert.dom(KEY_INPUT).hasValue('k');

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

    assert.dom(KEY_INPUT).exists();
    assert.dom(VALUE_INPUT).doesNotExist();
    assert.dom(ADD_BUTTON).exists();
    assert.dom(DELETE_BUTTON).doesNotExist();
  });

  test('it displays error messages in footer (model errors)', async function (assert) {
    const model = {
      tags: [{ key: '', value: '' }],
      errors: {
        tags: [
          { message: 'Key is required' },
          { message: 'Value must be unique' },
        ],
      },
    };
    this.set('model', model);
    this.set('properties', ['key', 'value']);

    // With errors
    await render(hbs`
      <Form::Field::KeyValue
        @model={{this.model}}
        @name="tags"
        @properties={{this.properties}}
        @data={{this.model.tags}}>
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
    assert.dom(ERROR_MESSAGE).exists().hasText('Key is required');
    assert
      .dom('[data-test-error-message]:nth-child(2)')
      .hasText('Value must be unique');

    // Without errors
    this.set('model', { ...model, errors: {} });
    await render(hbs`
      <Form::Field::KeyValue
        @model={{this.model}}
        @name="tags"
        @properties={{this.properties}}
        @data={{this.model.tags}}>
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
    assert.dom(ERROR_MESSAGE).doesNotExist();
  });

  test('it updates both key and value fields using custom handlers', async function (assert) {
    this.set('data', [{ key: '', value: '' }]);
    this.set('onUpdate', (rowData, property, { target: { value } }) => {
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

    await fillIn(KEY_INPUT, 'test-key');
    await fillIn(VALUE_INPUT, 'test-value');

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

  test('custom handlers take precedence over default handlers', async function (assert) {
    const model = {
      tags: [{ key: '', value: '' }],
      errors: {
        tags: [
          { message: 'Key is required' },
          { message: 'Value must be unique' },
        ],
      },
    };
    this.set('model', model);

    this.set('onAdd', () => {
      model.tags.push({ key: 'custom', value: 'custom' });
      this.set('model', { ...model, tags: [...model.tags] });
    });

    this.set('onRemove', (rowData) => {
      model.tags = model.tags.filter((item) => item !== rowData);
      this.set('model', { ...model, tags: [...model.tags] });
    });

    await render(hbs`
      <Form::Field::KeyValue
        @model={{this.model}}
        @name="tags"
        @properties={{array 'key' 'value'}}
        @data={{this.model.tags}}
        @onAdd={{this.onAdd}}
        @onRemove={{this.onRemove}}
        @onUpdate={{this.onUpdate}}>
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
      </Form::Field::KeyValue>
    `);

    // Test custom add handler takes precedence
    await click(ADD_BUTTON);

    assert.strictEqual(model.tags.length, 2);
    assert.strictEqual(model.tags[1].key, 'custom');
    assert.strictEqual(model.tags[1].value, 'custom');

    // Test custom update handler takes precedence
    await fillIn(getKeyInputs()[0], 'test');

    // Test custom remove handler takes precedence
    await click(getDeleteButtons()[0]);

    assert.strictEqual(model.tags.length, 1);
    assert.strictEqual(model.tags[0].key, 'custom');
  });

  test('it adds row using default handler (model/name/properties)', async function (assert) {
    const model = { tags: [{ key: 'a', value: 'b' }] };
    this.set('model', model);
    this.set('properties', ['key', 'value']);

    await render(hbs`
      <Form::Field::KeyValue
        @model={{this.model}}
        @name="tags"
        @properties={{this.properties}}
        @data={{this.model.tags}}>
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

    assert.strictEqual(model.tags.length, 1);

    await click(ADD_BUTTON);

    assert.strictEqual(model.tags.length, 2);

    assert.deepEqual(model.tags[1], { key: '', value: '' });
  });

  test('it removes row using default handler (model/name)', async function (assert) {
    const model = {
      tags: [
        { key: 'a', value: 'b' },
        { key: 'c', value: 'd' },
      ],
    };
    this.set('model', model);
    this.set('properties', ['key', 'value']);

    await render(hbs`
      <Form::Field::KeyValue
        @model={{this.model}}
        @name="tags"
        @properties={{this.properties}}
        @data={{this.model.tags}}>
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

    assert.strictEqual(model.tags.length, 2);

    await click(getDeleteButtons()[0]);

    assert.strictEqual(model.tags.length, 1);

    assert.deepEqual(model.tags[0], { key: 'c', value: 'd' });
  });

  test('it updates row using default handler (model/name)', async function (assert) {
    const model = { tags: [{ key: '', value: '' }] };
    this.set('model', model);
    this.set('properties', ['key', 'value']);

    await render(hbs`
      <Form::Field::KeyValue
        @model={{this.model}}
        @name="tags"
        @properties={{this.properties}}
        @data={{this.model.tags}}>
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

    await fillIn(KEY_INPUT, 'updated-key');
    await fillIn(VALUE_INPUT, 'updated-value');

    assert.strictEqual(model.tags[0].key, 'updated-key');
    assert.strictEqual(model.tags[0].value, 'updated-value');
  });

  test('canDelete uses properties argument correctly (trash icon visible)', async function (assert) {
    // Multiple rows: trash icon should be visible
    this.set('data', [
      { key: 'foo', value: 'bar' },
      { key: '', value: '' },
    ]);
    this.set('properties', ['key', 'value']);
    await render(hbs`
      <Form::Field::KeyValue @data={{this.data}} @properties={{this.properties}}>
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
      </Form::Field::KeyValue>
    `);

    assert.dom(DELETE_BUTTON).isVisible();

    // Single row, property is empty: trash icon should not be visible
    this.set('data', [{ key: '', value: '' }]);
    await render(hbs`
      <Form::Field::KeyValue @data={{this.data}} @properties={{this.properties}}>
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
      </Form::Field::KeyValue>
    `);

    assert.dom(DELETE_BUTTON).isNotVisible();

    // Single row, property is set: trash icon should be visible
    this.set('data', [{ key: 'foo', value: '' }]);
    await render(hbs`
      <Form::Field::KeyValue @data={{this.data}} @properties={{this.properties}}>
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
      </Form::Field::KeyValue>
    `);

    assert.dom(DELETE_BUTTON).isVisible();
  });
});
