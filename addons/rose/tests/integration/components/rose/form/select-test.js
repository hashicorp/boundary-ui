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
        as |Field|
      >
        <Field as |select|>
          <select.option>Choose an option</select.option>
          <select.option @value="value-1">Value 1</select.option>
          <select.option @value="value-2">Value 2</select.option>
          <select.option @value="value-3">Value 3</select.option>
        </Field>
      </Rose::Form::Select>
    `);
    assert.equal(find('label').textContent.trim(), 'Label');
    assert.ok(find('select'));
    assert.equal(findAll('option').length, 4);
  });

  test('it displays optional helper text', async function (assert) {
    this.onChange = () => {};
    await render(hbs`
      <Rose::Form::Select
        @label="Label"
        @helperText="Help me"
        @onChange={{fn this.onChange}}
        as |Field|
      >
        <Field as |select|>
          <select.option>Choose an option</select.option>
        </Field>
      </Rose::Form::Select>
    `);
    const fieldEl = find('select');
    const id = fieldEl.id;
    const helperId = `helper-text-${id}`;
    const helperTextEl = find('.rose-form-select-helper-text');
    assert.equal(helperTextEl.textContent.trim(), 'Help me');
    assert.equal(helperTextEl.id, helperId);
    assert.equal(fieldEl.getAttribute('aria-describedby'), helperId);
  });

  test('it supports disabled attribute', async function (assert) {
    this.onChange = () => {};
    await render(hbs`
      <Rose::Form::Select
        @onChange={{fn this.onChange}}
        @disabled={{true}}
        as |Field|
      >
        <Field as |select|>
          <select.option>Choose an option</select.option>
        </Field>
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
        as |Field|
      >
        <Field as |select|>
          <select.option @value="value-1">value-1</select.option>
          <select.option @value="value-2">value-2</select.option>
        </Field>
      </Rose::Form::Select>
    `);
    assert.equal(find('select').value, 'value-1');
    this.set('value', 'value-2');
    assert.equal(find('select').value, 'value-2');
  });

  test('it triggers an action on change', async function (assert) {
    assert.expect(2);
    this.onChange1 = (value) => {
      assert.equal(
        value,
        null,
        'On initial render, onChange is triggered with null'
      );
      this.set('onChange', this.onChange2);
    };
    this.onChange2 = (value) => {
      assert.equal(value, 'value-1', 'On change, value is passed in.');
    };
    this.onChange = this.onChange1;
    await render(hbs`
      <Rose::Form::Select
        @name="my-select"
        @onChange={{fn this.onChange}}
        as |Field|
      >
        <Field as |select|>
          <select.option>Choose an option</select.option>
          <select.option @value="value-1">value-1</select.option>
        </Field>
      </Rose::Form::Select>
    `);
    await fillIn('[name="my-select"]', 'value-1');
  });
});
