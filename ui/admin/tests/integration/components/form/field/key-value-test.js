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
    await render(hbs`<Form::Field::KeyValue />`);

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

    await render(hbs`<Form::Field::KeyValue @data={{this.data}} />`);

    const keyInputs = getKeyInputs();
    const valueInputs = getValueInputs();

    assert.strictEqual(keyInputs.length, 2);
    assert.strictEqual(valueInputs.length, 2);
    assert.dom(keyInputs[0]).hasValue('env');
    assert.dom(keyInputs[1]).hasValue('region');
    assert.dom(valueInputs[0]).hasValue('production');
    assert.dom(valueInputs[1]).hasValue('us-east-1');
  });

  test('it renders all provided arguments correctly', async function (assert) {
    await render(hbs`
      <Form::Field::KeyValue 
        @name="test-name"
        @disabled={{true}}
        @keyLabel="Custom Key Label"
        @valueLabel="Custom Value Label"
        @legend="Test Legend"
        @helperText="Test helper text"
        @isRequired={{true}}
        @isOptional={{false}}
      />
    `);

    // Check name attribute
    assert.dom('[data-test-key-input]').hasAttribute('name', 'test-name');
    assert.dom('[data-test-value-input]').hasAttribute('name', 'test-name');

    // Check disabled state
    assert.dom('[data-test-key-input]').hasAttribute('disabled');
    assert.dom('[data-test-value-input]').hasAttribute('disabled');

    // Check that labels are rendered (they should be present in the DOM text)
    assert.dom(this.element).includesText('Custom Key Label');
    assert.dom(this.element).includesText('Custom Value Label');

    // Check legend and helper text using the correct selectors
    assert.dom('[data-test-legend]').includesText('Test Legend');
    assert.dom('[data-test-helper-text]').hasText('Test helper text');
  });

  test('it adds new rows', async function (assert) {
    let updatedData = null;
    this.set('onChange', (data) => {
      updatedData = data;
    });

    await render(hbs`
      <Form::Field::KeyValue 
        @onChange={{this.onChange}}
      />
    `);

    assert.strictEqual(getKeyInputs().length, 1);

    await click('[data-test-add-button]');

    assert.strictEqual(getKeyInputs().length, 2);
    assert.strictEqual(getValueInputs().length, 2);
    // Empty keys are filtered out when notifying parent
    assert.strictEqual(updatedData.length, 0);
    assert.deepEqual(updatedData, []);

    await fillIn(getKeyInputs()[1], 'test-key');

    assert.strictEqual(updatedData.length, 1);
    assert.deepEqual(updatedData[0], { key: 'test-key', value: '' });
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
      <Form::Field::KeyValue 
        @data={{this.data}}
        @onChange={{this.onChange}}
      />
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
      <Form::Field::KeyValue 
        @data={{this.data}}
        @onChange={{this.onChange}}
      />
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

  // Field type tests
  test('it handles text input field types (default)', async function (assert) {
    await render(hbs`<Form::Field::KeyValue @name="test-form" />`);

    assert.dom('[data-test-key-input]').hasTagName('input');
    assert.dom('[data-test-key-input]').hasAttribute('type', 'text');
    assert.dom('[data-test-key-input]').hasAttribute('name', 'test-form');
    assert.dom('[data-test-value-input]').hasTagName('input');
    assert.dom('[data-test-value-input]').hasAttribute('type', 'text');
    assert.dom('[data-test-value-input]').hasAttribute('name', 'test-form');
  });

  test('it handles select field types', async function (assert) {
    this.set('selectOptions', ['subject', 'email', 'name']);

    await render(hbs`
      <Form::Field::KeyValue 
        @valueFieldType="select"
        @valueFieldOptions={{this.selectOptions}}
      />
    `);

    assert.dom('[data-test-key-input]').hasTagName('input');
    assert.dom('[data-test-value-input]').hasTagName('select');

    const options = findAll('[data-test-value-input] option');
    assert.strictEqual(options.length, 4);
    assert.dom(options[0]).hasText('Choose an option');
    assert.dom(options[1]).hasText('subject');
    assert.dom(options[2]).hasText('email');
    assert.dom(options[3]).hasText('name');
  });

  test('it handles textarea field types', async function (assert) {
    await render(hbs`
      <Form::Field::KeyValue 
        @name="test-form"
        @keyFieldType="textarea"
        @valueFieldType="textarea"
      />
    `);

    assert.dom('[data-test-key-input]').hasTagName('textarea');
    assert.dom('[data-test-key-input]').hasAttribute('name', 'test-form');
    assert.dom('[data-test-value-input]').hasTagName('textarea');
    assert.dom('[data-test-value-input]').hasAttribute('name', 'test-form');
  });

  test('it handles mixed field types', async function (assert) {
    this.set('keyOptions', ['key1', 'key2']);

    await render(hbs`
      <Form::Field::KeyValue 
        @name="test-form"
        @keyFieldType="select"
        @valueFieldType="textarea"
        @keyFieldOptions={{this.keyOptions}}
      />
    `);

    assert.dom('[data-test-key-input]').hasTagName('select');
    assert.dom('[data-test-key-input]').hasAttribute('name', 'test-form');
    assert.dom('[data-test-value-input]').hasTagName('textarea');
    assert.dom('[data-test-value-input]').hasAttribute('name', 'test-form');
  });

  // Hide value field tests
  test('it hides value field when `hideValueField` is true', async function (assert) {
    await render(hbs`<Form::Field::KeyValue @hideValueField={{true}} />`);

    assert.dom('[data-test-key-input]').exists();
    assert.dom('[data-test-value-input]').doesNotExist();
    assert.dom('[data-test-add-button]').exists();
    assert.dom('[data-test-delete-button]').exists();
  });

  test('it shows value field when `hideValueField` is false', async function (assert) {
    await render(hbs`<Form::Field::KeyValue @hideValueField={{false}} />`);

    assert.dom('[data-test-key-input]').exists();
    assert.dom('[data-test-value-input]').exists();
  });

  test('it shows value field by default when `hideValueField` is not provided', async function (assert) {
    await render(hbs`<Form::Field::KeyValue />`);

    assert.dom('[data-test-key-input]').exists();
    assert.dom('[data-test-value-input]').exists();
  });

  // Error handling tests
  test('it displays error messages in footer', async function (assert) {
    this.set('errors', [
      { message: 'Key is required' },
      { message: 'Value must be unique' },
    ]);

    await render(hbs`
      <Form::Field::KeyValue @errors={{this.errors}} />
    `);

    assert.dom('[data-test-error-message]').exists({ count: 2 });
    assert.dom('[data-test-error-message]').hasText('Key is required');
    assert
      .dom('[data-test-error-message]:nth-child(2)')
      .hasText('Value must be unique');
  });

  test('it does not show error messages when no errors are provided', async function (assert) {
    await render(hbs`<Form::Field::KeyValue />`);

    assert.dom('[data-test-error-message]').doesNotExist();
  });

  // Update tests
  test('it updates textarea key values correctly', async function (assert) {
    let updatedData = null;
    this.set('onChange', (data) => {
      updatedData = data;
    });

    await render(hbs`
      <Form::Field::KeyValue 
        @keyFieldType="textarea"
        @onChange={{this.onChange}}
      />
    `);

    await fillIn('[data-test-key-input]', 'textarea');

    assert.strictEqual(updatedData.length, 1);
    assert.strictEqual(updatedData[0].key, 'textarea');
  });

  test('it updates textarea value fields correctly', async function (assert) {
    let updatedData = null;
    this.set('onChange', (data) => {
      updatedData = data;
    });

    await render(hbs`
      <Form::Field::KeyValue 
        @valueFieldType="textarea"
        @onChange={{this.onChange}}
      />
    `);

    await fillIn('[data-test-key-input]', 'test-key');
    await fillIn('[data-test-value-input]', 'test-value');

    assert.strictEqual(updatedData.length, 1);
    assert.strictEqual(updatedData[0].key, 'test-key');
    assert.strictEqual(updatedData[0].value, 'test-value');
  });

  test('it updates select field values', async function (assert) {
    let updatedData = null;
    this.set('onChange', (data) => {
      updatedData = data;
    });
    this.set('selectOptions', ['subject', 'email', 'name']);

    await render(hbs`
      <Form::Field::KeyValue 
        @onChange={{this.onChange}}
        @valueFieldType="select"
        @valueFieldOptions={{this.selectOptions}}
      />
    `);

    await fillIn('[data-test-value-input]', 'email');

    // Empty key is filtered out, so no data is sent to parent
    assert.strictEqual(updatedData.length, 0);

    await fillIn('[data-test-key-input]', 'claim');
    await fillIn('[data-test-value-input]', 'email');

    assert.strictEqual(updatedData.length, 1);
    assert.strictEqual(updatedData[0].key, 'claim');
    assert.strictEqual(updatedData[0].value, 'email');
  });

  test('it updates key values', async function (assert) {
    let updatedData = null;
    this.set('onChange', (data) => {
      updatedData = data;
    });

    await render(hbs`<Form::Field::KeyValue @onChange={{this.onChange}} />`);
    await fillIn('[data-test-key-input]', 'test-key');

    assert.strictEqual(updatedData[0].key, 'test-key');
    assert.strictEqual(updatedData[0].value, '');
  });

  test('it filters out rows with empty keys when updating values', async function (assert) {
    let updatedData = null;
    this.set('onChange', (data) => {
      updatedData = data;
    });

    await render(hbs`<Form::Field::KeyValue @onChange={{this.onChange}} />`);
    await fillIn('[data-test-value-input]', 'test-value');

    // Empty key is filtered out, so no data is sent to parent
    assert.strictEqual(updatedData.length, 0);
  });

  test('it updates value fields when key is present', async function (assert) {
    let updatedData = null;
    this.set('onChange', (data) => {
      updatedData = data;
    });

    await render(hbs`<Form::Field::KeyValue @onChange={{this.onChange}} />`);
    await fillIn('[data-test-key-input]', 'test-key');
    await fillIn('[data-test-value-input]', 'test-value');

    assert.strictEqual(updatedData.length, 1);
    assert.strictEqual(updatedData[0].key, 'test-key');
    assert.strictEqual(updatedData[0].value, 'test-value');
  });
});
