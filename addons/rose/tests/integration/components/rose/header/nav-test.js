import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/header/nav', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Header::nav />`);
    assert.ok(find('.rose-header-nav'));
  });

  test('it renders nav link elements', async function (assert) {
    await render(hbs`<Rose::Header::nav as |nav| >
      <nav.link @route="index"/>
      <nav.link @route="about"/>
    </Rose::Header::nav>`);
    assert.equal(findAll('a').length, 2);
  });

  test('it renders nav dropdown elements', async function (assert) {
    await render(hbs`<Rose::Header::nav as |nav| >
      <nav.dropdown />
      <nav.dropdown />
    </Rose::Header::nav>`);
    assert.equal(findAll('.rose-dropdown').length, 2);
  });
});
