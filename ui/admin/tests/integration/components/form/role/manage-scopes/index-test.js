import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | form/role/manage-scopes/index',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await render(hbs`<Form::Role::ManageScopes::Index />`);

      assert.dom(this.element).hasText('');

      // Template block usage:
      await render(hbs`
      <Form::Role::ManageScopes::Index>
        template block text
      </Form::Role::ManageScopes::Index>
    `);

      assert.dom(this.element).hasText('template block text');
    });
  },
);
