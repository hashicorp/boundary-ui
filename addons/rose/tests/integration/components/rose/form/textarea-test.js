import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/form/textarea', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Form::Textarea @value="Text" @label="Label" />`);
    assert.equal(await find('label').textContent.trim(), 'Label');
    assert.equal(await find('textarea').value, 'Text');
  });

  test('it displays optional helper text', async function (assert) {
    await render(hbs`<Rose::Form::Textarea @helperText="Help me" />`);
    const fieldEl = find('textarea');
    const id = fieldEl.id;
    const helperId = `helper-text-${id}`;
    const helperTextEl = find('.rose-form-input-helper-text');
    assert.equal(helperTextEl.textContent.trim(), 'Help me');
    assert.equal(helperTextEl.id, helperId);
    assert.equal(fieldEl.getAttribute('aria-describedby').trim(), helperId);
  });

  test('it displays optional errors', async function (assert) {
    await render(hbs`
      <Rose::Form::Textarea @error={{true}} as |field|>
        <field.errors as |errors|>
          <errors.message>An error occurred.</errors.message>
        </field.errors>
      </Rose::Form::Textarea>
    `);
    const fieldEl = find('textarea');
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

  test('it supports disabled attribute', async function (assert) {
    await render(hbs`<Rose::Form::Textarea @disabled={{true}} />`);
    assert.ok(await find('[disabled]'));
  });

  test('it supports readonly attribute', async function (assert) {
    await render(hbs`<Rose::Form::Textarea readonly={{true}} />`);
    assert.ok(await find('[readonly]'));
  });

  test('it gets an `error` class when @error=true', async function (assert) {
    await render(hbs`<Rose::Form::Textarea @error={{true}} />`);
    assert.ok(await find('.error'));
  });
});
