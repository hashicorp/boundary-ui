import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | host-catalogs/host-catalog/navigation', function(hooks) {
  setupRenderingTest(hooks);

  test.skip('it renders', async function(assert) {
    await render(hbs`
      <HostCatalogs::HostCatalog::Navigation @model={{record}} />
    `);
  });
});
