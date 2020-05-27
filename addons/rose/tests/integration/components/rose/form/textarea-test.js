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
    assert.equal(
      await find('.rose-form-input-helper-text').textContent.trim(),
      'Help me'
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
