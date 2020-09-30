import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/footer/copyright', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(1);
    await render(hbs`<Rose::Footer::Copyright @text="copyright" />`);
    assert.equal(find('.rose-footer-copyright-text').textContent.trim(), 'copyright');
  });

  test('it renders with current year', async function (assert) {
    assert.expect(1);
    await render(hbs`<Rose::Footer::Copyright />`);
    assert.equal(find('.rose-footer-copyright-year').textContent.trim(), new Date().getFullYear());
  });
});
