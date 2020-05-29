import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/form/checkbox', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Form::Checkbox @label="Label" />`);
    assert.equal(await find('label').textContent.trim(), 'Label');
    assert.ok(await find('input'));
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
    assert.equal(await find('input').checked, false);
  });

  test('it is not disabled by default', async function (assert) {
    await render(hbs`<Rose::Form::Checkbox />`);
    assert.equal(await find('input').disabled, false);
  });

  test('it is checked when @checked={{true}}', async function (assert) {
    await render(hbs`<Rose::Form::Checkbox @checked={{true}} />`);
    assert.equal(await find('input').checked, true);
  });

  test('it marks error when @error={{true}}', async function (assert) {
    await render(hbs`<Rose::Form::Checkbox @error={{true}} />`);
    assert.ok(await find('.error'));
  });

  test('it is disabled when @disabled={{true}}', async function (assert) {
    await render(hbs`<Rose::Form::Checkbox @disabled={{true}} />`);
    assert.equal(await find('input').disabled, true);
  });
});
