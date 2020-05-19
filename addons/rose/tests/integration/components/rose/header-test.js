import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/header', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Header />`);
    assert.ok(find('.rose-header'));
  });

  test('it renders with brand', async function (assert) {
    await render(hbs`<Rose::Header as |header| >
      <header.brand></header.brand>
    </Rose::Header>`);
    assert.ok(find('.rose-header-brand'));
    assert.notOk(find('.rose-header-navigation'));
    assert.notOk(find('.rose-header-utilities'));
  });

  test('it renders with navigation', async function (assert) {
    await render(hbs`<Rose::Header as |header| >
      <header.navigation />
    </Rose::Header>`);
    assert.ok(find('.rose-header-navigation'));
    assert.notOk(find('.rose-header-brand'));
    assert.notOk(find('.rose-header-utilities'));
  });

  test('it renders with navigation elements', async function (assert) {
    await render(hbs`<Rose::Header as |header| >
      <header.navigation as |nav|>
        <nav.link @route="about"/>
      </header.navigation>
    </Rose::Header>`);
    assert.ok(find('.rose-header-navigation-link'));
  });

  test('it renders with utilities', async function (assert) {
    await render(hbs`<Rose::Header as |header| >
      <header.utilities />
    </Rose::Header>`);
    assert.notOk(find('.rose-header-brand'));
    assert.notOk(find('.rose-header-navigation'));
    assert.ok(find('.rose-header-utilities'));
  });

  test('it renders with utility elements', async function (assert) {
    await render(hbs`<Rose::Header as |header| >
      <header.utilities as |utility| >
        <utility.dropdown />
      </header.utilities>
    </Rose::Header>`);
    assert.ok(find('.rose-header-dropdown'));
  });
});
