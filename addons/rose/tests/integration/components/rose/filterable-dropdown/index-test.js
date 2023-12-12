import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | rose/filterable-dropdown/index',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
      await render(hbs`<Rose::FilterableDropdown />`);

      assert.dom(this.element).hasText('');

      await render(hbs`
      <Rose::FilterableDropdown>
        template block text
      </Rose::FilterableDropdown>
    `);

      assert.dom(this.element).hasText('template block text');
    });
  },
);
