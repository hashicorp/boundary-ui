import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/footer/product', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders with product', async function (assert) {
    assert.expect(3);
    await render(hbs`<Rose::Footer::Product @text="boundary" />`);
    assert.ok(find('.rose-footer-product'));
    assert.equal(find('.rose-footer-product-text').textContent.trim(), 'boundary');
    assert.notOk(find('.rose-footer-product-version'));
  });

  test('it renders with product and version', async function (assert) {
    assert.expect(1);
    await render(hbs`<Rose::Footer::Product @version="1.0" />`);
    assert.equal(find('.rose-footer-product-version').textContent.trim(), 'v1.0');
  });
});
