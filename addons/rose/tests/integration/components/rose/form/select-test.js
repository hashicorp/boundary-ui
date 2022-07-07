import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, findAll, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/form/select', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.onChange = () => {};
    await render(hbs`
      <Rose::Form::Select
        @label="Label"
        @onChange={{fn this.onChange}}
        as |field|
      >
        <field.field as |select|>
          <select.option>Choose an option</select.option>
          <select.option @value="value-1">Value 1</select.option>
          <select.option @value="value-2">Value 2</select.option>
          <select.option @value="value-3">Value 3</select.option>
        </field.field>
      </Rose::Form::Select>
    `);
    assert.strictEqual(find('label').textContent.trim(), 'Label');
    assert.ok(find('select'));
    assert.strictEqual(findAll('option').length, 4);
  });

  test('it displays optional helper text', async function (assert) {
    this.onChange = () => {};
    await render(hbs`
      <Rose::Form::Select
        @label="Label"
        @helperText="Help me"
        @onChange={{fn this.onChange}}
        as |field|
      >
        <field.field as |select|>
          <select.option>Choose an option</select.option>
        </field.field>
      </Rose::Form::Select>
    `);
    const fieldEl = find('select');
    const id = fieldEl.id;
    const helperId = `helper-text-${id}`;
    const helperTextEl = find('.rose-form-helper-text');
    assert.strictEqual(helperTextEl.textContent.trim(), 'Help me');
    assert.strictEqual(helperTextEl.id, helperId);
    assert.strictEqual(fieldEl.getAttribute('aria-describedby').trim(), helperId);
  });

  test('it displays optional errors', async function (assert) {
    this.onChange = () => {};
    await render(hbs`
      <Rose::Form::Select
        @label="Label"
        @helperText="Help me"
        @onChange={{fn this.onChange}}
        @error={{true}}
        as |field|
      >
        <field.field as |select|>
          <select.option>Choose an option</select.option>
        </field.field>
        <field.errors as |errors|>
          <errors.message>An error occurred.</errors.message>
        </field.errors>
      </Rose::Form::Select>
    `);
    const fieldEl = find('select');
    const id = fieldEl.id;
    const errorsId = `errors-${id}`;
    const errorMessageEl = find('.rose-form-errors');
    assert.strictEqual(errorMessageEl.id, errorsId);
    assert.strictEqual(errorMessageEl.textContent.trim(), 'An error occurred.');
    assert.strictEqual(
      fieldEl.getAttribute('aria-describedby').split(' ')[1],
      errorsId
    );
  });

  test('it supports disabled attribute', async function (assert) {
    this.onChange = () => {};
    await render(hbs`
      <Rose::Form::Select
        @onChange={{fn this.onChange}}
        @disabled={{true}}
        as |field|
      >
        <field.field as |select|>
          <select.option>Choose an option</select.option>
        </field.field>
      </Rose::Form::Select>
    `);
    assert.ok(find('[disabled]'));
  });

  test('its value is bound to and udpated by @value', async function (assert) {
    this.onChange = () => {};
    this.value = 'value-1';
    await render(hbs`
      <Rose::Form::Select
        @onChange={{fn this.onChange}}
        @value={{value}}
        as |field|
      >
        <field.field as |select|>
          <select.option @value="value-1">value-1</select.option>
          <select.option @value="value-2">value-2</select.option>
        </field.field>
      </Rose::Form::Select>
    `);
    assert.strictEqual(find('select').value, 'value-1');
    this.set('value', 'value-2');
    assert.strictEqual(find('select').value, 'value-2');
  });

  test('it triggers an action on change', async function (assert) {
    assert.expect(2);
    this.onChange1 = (value) => {
      assert.strictEqual(
        value,
        null,
        'On initial render, onChange is triggered with null'
      );
      this.set('onChange', this.onChange2);
    };
    this.onChange2 = (value) => {
      assert.strictEqual(value, 'value-1', 'On change, value is passed in.');
    };
    this.onChange = this.onChange1;
    await render(hbs`
      <Rose::Form::Select
        @name="my-select"
        @onChange={{fn this.onChange}}
        as |field|
      >
        <field.field as |select|>
          <select.option>Choose an option</select.option>
          <select.option @value="value-1">value-1</select.option>
        </field.field>
      </Rose::Form::Select>
    `);
    await fillIn('[name="my-select"]', 'value-1');
  });

  test('it supports a fully contextual usage', async function (assert) {
    assert.expect(5);
    await render(hbs`
      <Rose::Form::Select @value="value-1" @error={{true}} @contextual={{true}} as |field|>
        <field.label>Label</field.label>
        <field.helperText>Help</field.helperText>
        <field.field as |select|>
          <select.option @value="value-1">value-1</select.option>
        </field.field>
        <field.errors as |errors|>
          <errors.message>An error occurred.</errors.message>
        </field.errors>
      </Rose::Form::Select>
    `);
    assert.notOk(
      find('.rose-form-input'),
      'The form field wrapper element is not present in contextual mode'
    );
    assert.ok(find('.rose-form-label.error'));
    assert.ok(find('.rose-form-helper-text.error'));
    assert.ok(find('.rose-form-select-field.error'));
    assert.ok(find('.rose-form-error-message'));
  });
});
