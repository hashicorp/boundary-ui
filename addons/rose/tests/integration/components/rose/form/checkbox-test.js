/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/form/checkbox', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(3);
    await render(hbs`<Rose::Form::Checkbox @label="Label" />`);
    assert.strictEqual(find('label').textContent.trim(), 'Label');
    assert.ok(find('input'));
    assert.notOk(find('.rose-form-checkbox-label-description'));
  });

  test('it renders optional description paragraph', async function (assert) {
    assert.expect(3);
    await render(
      hbs`<Rose::Form::Checkbox @label="Label" @description="Hello world" />`
    );
    assert.strictEqual(
      find('.rose-form-checkbox-label-text').textContent.trim(),
      'Label'
    );
    assert.strictEqual(
      find('.rose-form-checkbox-label-description').textContent.trim(),
      'Hello world'
    );
    assert.ok(find('input'));
  });

  test('it renders optional helper text', async function (assert) {
    assert.expect(1);
    await render(
      hbs`<Rose::Form::Checkbox @label="Label" @helperText="Hello world" />`
    );
    assert.strictEqual(
      find('.rose-form-helper-text').textContent.trim(),
      'Hello world'
    );
  });

  test('it displays optional errors', async function (assert) {
    await render(hbs`
      <Rose::Form::Checkbox @error={{true}} as |field|>
        <field.errors as |errors|>
          <errors.message>An error occurred.</errors.message>
        </field.errors>
      </Rose::Form::Checkbox>
    `);
    const fieldEl = find('input');
    const id = fieldEl.id;
    const errorsId = `errors-${id}`;
    const errorMessageEl = find('.rose-form-errors');
    assert.strictEqual(errorMessageEl.id, errorsId);
    assert.strictEqual(errorMessageEl.textContent.trim(), 'An error occurred.');
    assert.strictEqual(
      fieldEl.getAttribute('aria-describedby').trim(),
      errorsId
    );
  });

  test('it is not checked by default', async function (assert) {
    await render(hbs`<Rose::Form::Checkbox />`);
    assert.false(find('input').checked);
  });

  test('it is not disabled by default', async function (assert) {
    await render(hbs`<Rose::Form::Checkbox />`);
    assert.false(find('input').disabled);
  });

  test('it is checked when @checked={{true}}', async function (assert) {
    await render(hbs`<Rose::Form::Checkbox @checked={{true}} />`);
    assert.true(find('input').checked);
  });

  test('it marks error when @error={{true}}', async function (assert) {
    await render(hbs`<Rose::Form::Checkbox @error={{true}} />`);
    assert.ok(find('.error'));
  });

  test('it is disabled when @disabled={{true}}', async function (assert) {
    await render(hbs`<Rose::Form::Checkbox @disabled={{true}} />`);
    assert.true(find('input').disabled);
  });
});
