import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/footer/brand', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(2);
    await render(hbs`<Rose::Footer::Brand @logo="logo" @text="Product Name" />`);
    assert.ok(find('.rose-footer-brand'));
    assert.ok(find('.rose-footer-brand svg'));
  });
});
