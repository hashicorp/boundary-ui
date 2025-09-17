import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | resource-query', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<ResourceQuery />`);

    assert.dom().hasText('');

    // Template block usage:
    await render(hbs`
      <ResourceQuery>
        template block text
      </ResourceQuery>
    `);

    assert.dom().hasText('template block text');
  });
});
