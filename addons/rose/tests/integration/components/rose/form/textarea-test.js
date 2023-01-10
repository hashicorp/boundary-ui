import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/form/textarea', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Form::Textarea @value="Text" @label="Label" />`);
    assert.strictEqual(await find('label').textContent.trim(), 'Label');
    assert.strictEqual(await find('textarea').value, 'Text');
  });

  test('it displays optional helper text', async function (assert) {
    await render(hbs`<Rose::Form::Textarea @helperText="Help me" />`);
    const fieldEl = find('textarea');
    const id = fieldEl.id;
    const helperId = `helper-text-${id}`;
    const helperTextEl = find('.rose-form-helper-text');
    assert.strictEqual(helperTextEl.textContent.trim(), 'Help me');
    assert.strictEqual(helperTextEl.id, helperId);
    assert.strictEqual(
      fieldEl.getAttribute('aria-describedby').trim(),
      helperId
    );
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
    assert.strictEqual(errorMessageEl.id, errorsId);
    assert.strictEqual(errorMessageEl.textContent.trim(), 'An error occurred.');
    assert.strictEqual(
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

  test('it supports a fully contextual usage', async function (assert) {
    assert.expect(5);
    await render(hbs`
      <Rose::Form::Textarea @value="Text" @error={{true}} @contextual={{true}} as |field|>
        <field.label>Label</field.label>
        <field.helperText>Help</field.helperText>
        <field.field />
        <field.errors as |errors|>
          <errors.message>An error occurred.</errors.message>
        </field.errors>
      </Rose::Form::Textarea>
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
