import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/header/brand', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(3);
    await render(hbs`
      <Rose::Header::Brand @logo="logo" @text="Product Name" />
    `);
    assert.ok(find('.rose-header-brand'));
    assert.ok(find('.rose-header-brand svg'));
    assert.strictEqual(
      find('.rose-header-brand-text').textContent.trim(),
      'Product Name'
    );
  });
});
