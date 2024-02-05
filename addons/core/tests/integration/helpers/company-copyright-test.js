import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | company-copyright', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    const currentYear = new Date().getFullYear();
    await render(hbs`{{company-copyright}}`);
    assert.strictEqual(
      this.element.textContent.trim(),
      `© ${currentYear} Company Name`,
    );
  });
});
