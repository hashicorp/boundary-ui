import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | host-catalogs/host-catalog/navigation', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<HostCatalogs::HostCatalog::Navigation />`);

    assert.dom(this.element).hasText('');

    // Template block usage:
    await render(hbs`
      <HostCatalogs::HostCatalog::Navigation>
        template block text
      </HostCatalogs::HostCatalog::Navigation>
    `);

    assert.dom(this.element).hasText('template block text');
  });
});
