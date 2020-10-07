import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | doc-link', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(1);
    await render(hbs`<DocLink @doc="account" @iconSize="large" />`);
    assert.ok(find('.doc-link .rose-icon.large'));
  });
});
