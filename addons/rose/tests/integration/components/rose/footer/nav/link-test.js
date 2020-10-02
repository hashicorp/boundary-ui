import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/footer/nav/link', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders with @href', async function (assert) {
    assert.expect(2);
    await render(hbs`<Rose::Footer::Nav::Link @href="localhost" />`);
    assert.ok(find('a'));
    assert.ok(find('.rose-footer-nav-link'));
  });

  test('it renders with @route', async function (assert) {
    assert.expect(2);
    await render(hbs`<Rose::Footer::Nav::Link @route="index" />`);
    assert.ok(find('a'));
    assert.ok(find('.rose-footer-nav-link'));
  });
});
