import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/form/input', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Form::Input @value="Text" @label="Label" />`);
    assert.equal(await find('label').textContent.trim(), 'Label');
    assert.equal(await find('input').value, 'Text');
  });

  test('it displays optional helper text', async function (assert) {
    await render(hbs`<Rose::Form::Input @helperText="Help me" />`);
    const fieldEl = find('input');
    const id = fieldEl.id;
    const helperId = `helper-text-${id}`;
    const helperTextEl = find('.rose-form-helper-text');
    assert.equal(helperTextEl.textContent.trim(), 'Help me');
    assert.equal(helperTextEl.id, helperId);
    assert.equal(fieldEl.getAttribute('aria-describedby').trim(), helperId);
  });

  test('it displays optional errors', async function (assert) {
    await render(hbs`
      <Rose::Form::Input @error={{true}} as |field|>
        <field.errors as |errors|>
          <errors.message>An error occurred.</errors.message>
        </field.errors>
      </Rose::Form::Input>
    `);
    const fieldEl = find('input');
    const id = fieldEl.id;
    const errorsId = `errors-${id}`;
    const errorMessageEl = find('.rose-form-errors');
    assert.equal(errorMessageEl.id, errorsId);
    assert.equal(errorMessageEl.textContent.trim(), 'An error occurred.');
    assert.equal(
      fieldEl.getAttribute('aria-describedby').split(' ')[1],
      errorsId
    );
  });

  test('it is type="text" by default', async function (assert) {
    await render(hbs`<Rose::Form::Input />`);
    assert.equal(await find('input').type, 'text');
  });

  test('it supports a @type attribute', async function (assert) {
    await render(hbs`<Rose::Form::Input @type="password" />`);
    assert.equal(await find('input').type, 'password');
  });

  test('it supports disabled attribute', async function (assert) {
    await render(hbs`<Rose::Form::Input @disabled={{true}} />`);
    assert.ok(await find('[disabled]'));
  });

  test('it supports readonly attribute', async function (assert) {
    await render(hbs`<Rose::Form::Input readonly={{true}} />`);
    assert.ok(await find('[readonly]'));
  });

  test('it gets an `error` class when @error=true', async function (assert) {
    await render(hbs`<Rose::Form::Input @error={{true}} />`);
    assert.ok(await find('.error'));
  });

  test('it supports a fully contextual usage', async function (assert) {
    assert.expect(5);
    await render(hbs`
      <Rose::Form::Input @value="Text" @error={{true}} @contextual={{true}} as |field|>
        <field.label>Label</field.label>
        <field.helperText>Help</field.helperText>
        <field.field />
        <field.errors as |errors|>
          <errors.message>An error occurred.</errors.message>
        </field.errors>
      </Rose::Form::Input>
    `);
    assert.notOk(
      find('.rose-form-input'),
      'The form field wrapper element is not present in contextual mode'
    );
    assert.ok(find('.rose-form-label.error'));
    assert.ok(find('.rose-form-helper-text.error'));
    assert.ok(find('.rose-form-input-field.error'));
    assert.ok(find('.rose-form-error-message'));
  });
});
