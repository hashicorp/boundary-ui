import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/header/utilities', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Header::Utilities />`);
    assert.ok(find('.rose-header-utilities'));
  });

  test('it renders nav dropdown elements', async function (assert) {
    await render(hbs`<Rose::Header::Utilities as |nav| >
      <nav.dropdown />
      <nav.dropdown />
    </Rose::Header::Utilities>`);
    assert.equal(findAll('.rose-dropdown').length, 2);
  });

  test('it renders nav dropdown elements as right aligned', async function (assert) {
    await render(hbs`<Rose::Header::Utilities as |nav| >
      <nav.dropdown />
    </Rose::Header::Utilities>`);
    assert.ok(find('.rose-dropdown.rose-dropdown-right'));
  });
});
