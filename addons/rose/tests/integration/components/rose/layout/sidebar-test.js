import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/layout/sidebar', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(3);
    await render(hbs`
      <Rose::Layout::Sidebar as |layout|>
        <layout.sidebar />
        <layout.body />
      </Rose::Layout::Sidebar>
    `);
    assert.ok(find('.rose-layout-sidebar'));
    assert.ok(find('.rose-layout-sidebar-body'));
    assert.ok(find('aside.rose-layout-sidebar-sidebar'));
  });
});
