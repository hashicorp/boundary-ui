import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | variable-time-field/index', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<VariableTimeField::Index />`);

    assert.dom().hasText('');

    // Template block usage:
    await render(hbs`
      <VariableTimeField::Index>
        template block text
      </VariableTimeField::Index>
    `);

    assert.dom().hasText('template block text');
  });
});
