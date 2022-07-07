import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | copyable', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(
      hbs`<Copyable @buttonText="Copy me" @text="foo">text</Copyable>`
    );
    assert.ok(find('.copyable'));
    assert.strictEqual(find('.copyable-content').textContent.trim(), 'text');
    assert.strictEqual(find('.copyable-button').textContent.trim(), 'Copy me');
  });
});
