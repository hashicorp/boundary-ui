import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/header/navigation', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Header::Navigation />`);
    assert.ok(find('.rose-header-navigation'));
  });

  test('it renders navigation link elements', async function (assert) {
    await render(hbs`<Rose::Header::Navigation as |navigation| >
      <navigation.link @route="about"/>
      <navigation.link @route="about"/>
    </Rose::Header::Navigation>`);
    assert.equal(findAll('a').length, 2);
  });

  test('it renders navigation dropdown elements', async function (assert) {
    await render(hbs`<Rose::Header::Navigation as |navigation| >
      <navigation.dropdown />
      <navigation.dropdown />
    </Rose::Header::Navigation>`);
    assert.equal(findAll('.rose-header-dropdown').length, 2);
  });
});
