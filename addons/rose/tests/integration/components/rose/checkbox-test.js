import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/checkbox', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders without label', async function (assert) {
    await render(hbs`<Rose::Checkbox />`);
    assert.equal(this.element.textContent.trim(), '');
    assert.equal(this.element.querySelector('input').type, 'checkbox');
  });

  test('it renders a checkbox', async function (assert) {
    await render(hbs`<Rose::Checkbox />`);
    assert.equal(this.element.querySelector('input').type, 'checkbox');
  });

  test('it renders with label', async function (assert) {
    await render(hbs`<Rose::Checkbox>Label</Rose::Checkbox>`);
    assert.equal(this.element.textContent.trim(), 'Label');
  });

  test('it is not checked', async function (assert) {
    await render(hbs`<Rose::Checkbox />`);
    assert.equal(this.element.querySelector('input').checked, false);
  });

  test('it is not disabled', async function (assert) {
    await render(hbs`<Rose::Checkbox />`);
    assert.equal(this.element.querySelector('input').disabled, false);
  });

  test('it renders with default style', async function (assert) {
    await render(hbs`<Rose::Checkbox />`);
    assert.equal(this.element.querySelector('label').className, 'rose-checkbox-default');
  });

  test('it is checked when @checked={{true}}', async function (assert) {
    await render(hbs`<Rose::Checkbox @checked={{true}} />`);
    assert.equal(this.element.querySelector('input').checked, true);
  });

  test('it marks error when @error={{true}}', async function (assert) {
    await render(hbs`<Rose::Checkbox @error={{true}} />`);
    assert.equal(this.element.querySelector('input').className, 'error');
  });

  test('it is disabled when @disabled={{true}}', async function (assert) {
    await render(hbs`<Rose::Checkbox @disabled={{true}} />`);
    assert.equal(this.element.querySelector('input').disabled, true);
  });

  test('it is disabled and checked when @disabled={{true}} and @checked={{true}}', async function (assert) {
    await render(
      hbs`<Rose::Checkbox @disabled={{true}} @checked={{true}}></Rose::Checkbox>`
    );
    assert.equal(this.element.querySelector('input').checked, true);
    assert.equal(this.element.querySelector('input').disabled, true);
  });

  test('it adds a style class when @style defines it', async function (assert) {
    await render(hbs`<Rose::Checkbox @style="primary" />`);
    assert.equal(this.element.querySelector('label').className, 'rose-checkbox-primary');
  });
});
