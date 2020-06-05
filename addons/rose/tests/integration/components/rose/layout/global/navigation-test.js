import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/layout/global/navigation', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Layout::Global::Navigation />`);
    assert.ok(find('aside'));
    assert.ok(find('.rose-layout-global-navigation'));
  });

  test('it renders with attributes', async function (assert) {
    await render(hbs`<Rose::Layout::Global::Navigation id="navigation"/>`);
    assert.ok(find('#navigation'));
  });

  test('it renders with content', async function (assert) {
    await render(hbs`<Rose::Layout::Global::Navigation>
      <button id="content" />
    </Rose::Layout::Global::Navigation>`);
    assert.ok(find('#content'));
  });
});
