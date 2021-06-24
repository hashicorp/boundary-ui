import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | raw-json', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('inputValue', {});
    await render(hbs`{{raw-json inputValue}}`);
    assert.equal(this.element.textContent.trim(), '{}');
    this.set('inputValue', { key: 'value', nestedKey: { key: 'value' } });
    assert.equal(
      this.element.textContent.trim(),
      `{\n  "key": "value",\n  "nestedKey": {\n    "key": "value"\n  }\n}`
    );
  });
});
