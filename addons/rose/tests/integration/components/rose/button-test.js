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
    assert.equal(await find('button').type, 'button');
  });

  test('it is type="submit" when @submit={{true}}', async function (assert) {
    await render(hbs`<Rose::Button @submit={{true}} />`);
    assert.equal(await find('button').type, 'submit');
  });

  test('it is disabled when @disabled={{true}}', async function (assert) {
    await render(hbs`<Rose::Button @disabled={{true}} />`);
    assert.equal(await find('button').disabled, true);
  });

  test('it adds a style class', async function (assert) {
    await render(hbs`<Rose::Button @style="primary" />`);
    assert.ok(await find('button.rose-button-primary'));
    await render(hbs`<Rose::Button @style="secondary" />`);
    assert.ok(await find('button.rose-button-secondary'));
  });
});
