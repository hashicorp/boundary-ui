import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | format-date-iso', function (hooks) {
  setupRenderingTest(hooks);

  test.skip('it renders', async function (assert) {
    this.set('inputValue', new Date('2020-01-01T00:00:00.999Z'));

    await render(hbs`{{format-date-iso inputValue}}`);

    assert.strictEqual(
      this.element.textContent.trim(),
      '2020-01-01T00:00:00.999Z'
    );
  });
});
