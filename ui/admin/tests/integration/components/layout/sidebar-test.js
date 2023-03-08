import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | layout/sidebar', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`
      <Layout::Sidebar as |sb|>
        <sb.body>Body content</sb.body>
        <sb.sidebar>Sidebar content</sb.sidebar>
      </Layout::Sidebar>
    `);

    assert.dom('.layout-sidebar').isVisible();
    assert.dom('.layout-sidebar-body').isVisible();
    assert.dom('.layout-sidebar-body').hasText('Body content');
    assert.dom('.layout-sidebar-sidebar').isVisible();
    assert.dom('.layout-sidebar-sidebar').hasText('Sidebar content');
  });
});
