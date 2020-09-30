import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/footer/nav', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(1);
    await render(hbs`<Rose::Footer::nav />`);
    assert.ok(find('.rose-footer-nav'));
  });

  test('it renders nav external link elements', async function (assert) {
    assert.expect(1);
    await render(hbs`<Rose::Footer::nav as |nav| >
      <nav.external-link @href="index"/>
      <nav.external-link @href="about"/>
    </Rose::Footer::nav>`);
    assert.equal(findAll('a').length, 2);
  });

});
