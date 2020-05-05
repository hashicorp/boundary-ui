import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/checkbox', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders without label', async function (assert) {
    await render(hbs`<Rose::Checkbox />`);
    assert.equal(this.element.textContent.trim(), '');
  });

  test('it renders a checkbox', async function (assert) {
    await render(hbs`<Rose::Checkbox />`);
    assert.equal(this.element.querySelector('input').type, 'checkbox');
  });

  test('it renders with label', async function (assert) {
    await render(hbs`<Rose::Checkbox>Label</Rose::Checkbox>`);
    assert.equal(this.element.textContent.trim(), 'Label');
  });

  test('it renders in a div wrapper', async function (assert) {
    await render(hbs`<Rose::Checkbox />`);
    assert.ok(this.element.querySelector('div.rose-checkbox'));
  });

  test('it renders a checkbox class', async function (assert) {
    await render(hbs`<Rose::Checkbox />`);
    assert.ok(this.element.querySelector('input.rose-checkbox-input'));
  });

  test('it renders a label class', async function (assert) {
    await render(hbs`<Rose::Checkbox />`);
    assert.ok(this.element.querySelector('label.rose-checkbox-label'));
  });

  test('it is not checked', async function (assert) {
    await render(hbs`<Rose::Checkbox />`);
    assert.equal(this.element.querySelector('input').checked, false);
  });

  test('it is not disabled', async function (assert) {
    await render(hbs`<Rose::Checkbox />`);
    assert.equal(this.element.querySelector('input').disabled, false);
  });

  test('it is checked when @checked={{true}}', async function (assert) {
    await render(hbs`<Rose::Checkbox @checked={{true}} />`);
    assert.equal(this.element.querySelector('input').checked, true);
  });

  test('it marks error when @error={{true}}', async function (assert) {
    await render(hbs`<Rose::Checkbox @error={{true}} />`);
    assert.ok(this.element.querySelector('div.error'));
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
});
