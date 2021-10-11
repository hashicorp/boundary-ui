import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/form/checkbox/', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(3);
    await render(hbs`<Rose::Form::Checkbox @label="Label" />`);
    assert.equal(find('label').textContent.trim(), 'Label');
    assert.ok(find('input'));
    assert.notOk(find('.rose-form-checkbox-label-description'));
  });

  test('it renders optional description paragraph', async function (assert) {
    assert.expect(3);
    await render(
      hbs`<Rose::Form::Checkbox @label="Label" @description="Hello world" />`
    );
    assert.equal(
      find('.rose-form-checkbox-label-text').textContent.trim(),
      'Label'
    );
    assert.equal(
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
    assert.equal(
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
    assert.equal(errorMessageEl.id, errorsId);
    assert.equal(errorMessageEl.textContent.trim(), 'An error occurred.');
    assert.equal(fieldEl.getAttribute('aria-describedby').trim(), errorsId);
  });

  test('it is not checked by default', async function (assert) {
    await render(hbs`<Rose::Form::Checkbox />`);
    assert.equal(find('input').checked, false);
  });

  test('it is not disabled by default', async function (assert) {
    await render(hbs`<Rose::Form::Checkbox />`);
    assert.equal(find('input').disabled, false);
  });

  test('it is checked when @checked={{true}}', async function (assert) {
    await render(hbs`<Rose::Form::Checkbox @checked={{true}} />`);
    assert.equal(find('input').checked, true);
  });

  test('it marks error when @error={{true}}', async function (assert) {
    await render(hbs`<Rose::Form::Checkbox @error={{true}} />`);
    assert.ok(find('.error'));
  });

  test('it is disabled when @disabled={{true}}', async function (assert) {
    await render(hbs`<Rose::Form::Checkbox @disabled={{true}} />`);
    assert.equal(find('input').disabled, true);
  });
});
