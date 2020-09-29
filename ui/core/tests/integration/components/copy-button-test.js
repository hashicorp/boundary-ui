import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | copy-button', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`<CopyButton>text</CopyButton>`);
    assert.ok(find('.copy-button'));
    assert.equal(find('.copy-target').textContent.trim(), 'text');
  });
});
