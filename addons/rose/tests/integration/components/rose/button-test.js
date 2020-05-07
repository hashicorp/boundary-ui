import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/button', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Button>Button 🌈</Rose::Button>`);
    assert.equal(this.element.textContent.trim(), 'Button 🌈');
  });

  test('it is type="button" by default', async function (assert) {
    await render(hbs`<Rose::Button>Button</Rose::Button>`);
    assert.equal(find('button').type, 'button');
  });

  test('it is type="submit" when @submit={{true}}', async function (assert) {
    await render(hbs`<Rose::Button @submit={{true}} />`);
    assert.equal(find('button').type, 'submit');
  });

  test('it is disabled when @disabled={{true}}', async function (assert) {
    await render(hbs`<Rose::Button @disabled={{true}} />`);
    assert.equal(find('button').disabled, true);
  });

  test('it adds a style class', async function (assert) {
    await render(hbs`<Rose::Button @style="primary" />`);
    assert.ok(find('.rose-button-primary'));
    await render(hbs`<Rose::Button @style="secondary" />`);
    assert.ok(find('.rose-button-secondary'));
  });

  test('it supports left and right icons', async function (assert) {
    await render(hbs`<Rose::Button @iconLeft="chevron-left" />`);
    assert.ok(find('.rose-button-icon-left'));
    await render(hbs`<Rose::Button @iconRight="chevron-left" />`);
    assert.ok(find('.rose-button-icon-right'));
  });

  test('it supports an icon-only type', async function (assert) {
    await render(hbs`<Rose::Button @iconOnly="chevron-left" />`);
    assert.ok(find('.rose-button-icon-only'));
    assert.ok(find('.rose-button-icon-only .rose-icon'));
  });
});
