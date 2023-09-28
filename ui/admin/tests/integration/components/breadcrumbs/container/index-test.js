import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | breadcrumbs/container/index',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await render(hbs`<Breadcrumbs::Container::Index />`);

      assert.dom(this.element).hasText('');

      // Template block usage:
      await render(hbs`
      <Breadcrumbs::Container::Index>
        template block text
      </Breadcrumbs::Container::Index>
    `);

      assert.dom(this.element).hasText('template block text');
    });
  }
);
