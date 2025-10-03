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

  test('it renders legend and helper text', async function (assert) {
    await render(hbs`
      <Form::Field::KeyValue 
        @legend="legend"
        @helperText="helper text"
      />
    `);

    assert.dom('[data-test-legend]').hasText('legend');
    assert.dom('[data-test-helper-text]').hasText('helper text');
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

  test('it updates value fields', async function (assert) {
    let updatedData = null;
    this.set('onChange', (data) => {
      updatedData = data;
    });

    await render(hbs`<Form::Field::KeyValue @onChange={{this.onChange}} />`);
    await fillIn('[data-test-value-input]', 'test-value');

    // Empty key is filtered out, so no data is sent to parent
    assert.strictEqual(updatedData.length, 0);
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
});
