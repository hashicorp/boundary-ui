import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/layout/page/sidebar', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Layout::Page::Sidebar />`);
    assert.ok(find('aside'));
    assert.ok(find('.rose-layout-sidebar'));
  });

  test('it renders with attributes', async function (assert) {
    await render(hbs`<Rose::Layout::Page::Sidebar id="sidebar"/>`);
    assert.ok(find('#sidebar'));
  });

  test('it renders with content', async function (assert) {
    await render(hbs`<Rose::Layout::Page::Sidebar>
      <button id="content" />
    </Rose::Layout::Page::Sidebar>`);
    assert.ok(find('#content'));
  });
});
