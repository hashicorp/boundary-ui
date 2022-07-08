import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/dropdown/button', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Dropdown::Button />`);
    assert.ok(find('.rose-dropdown-button'));
  });

  test('it is type="button" by default', async function (assert) {
    await render(hbs`<Rose::Dropdown::Button />`);
    assert.strictEqual(find('button').type, 'button');
  });

  test('it is type="submit" when @submit={{true}}', async function (assert) {
    await render(hbs`<Rose::Dropdown::Button @submit={{true}} />`);
    assert.strictEqual(find('button').type, 'submit');
  });

  test('it is disabled when @disabled={{true}}', async function (assert) {
    await render(hbs`<Rose::Dropdown::Button @disabled={{true}} />`);
    assert.true(find('button').disabled);
  });

  test('it adds a style class', async function (assert) {
    await render(hbs`<Rose::Dropdown::Button @style="warning" />`);
    assert.ok(find('.rose-dropdown-button-warning'));
  });

  test('it supports an icon-only type', async function (assert) {
    await render(
      hbs`<Rose::Dropdown::Button @iconOnly="flight-icons/svg/chevron-left-16" />`
    );
    assert.ok(find('.has-icon-only .rose-icon'));
  });
});
