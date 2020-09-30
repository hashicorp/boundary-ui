import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/footer/nav/external-link', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders with link', async function (assert) {
    assert.expect(2);
    await render(hbs`<Rose::Footer::Nav::ExternalLink />`);
    assert.ok(find('a'));
    assert.ok(find('.rose-footer-nav-external-link'));
  });
});
