import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | form/field/json-secret/skeleton',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
      assert.expect(2);
      await render(hbs`
      <Form::Field::JsonSecret::Skeleton>
        Skeleton Message
      </Form::Field::JsonSecret::Skeleton>
    `);

      assert.dom('.secret-editor-skeleton-wrapper').isVisible();
      assert.dom('.secret-editor-skeleton-message').hasText('Skeleton Message');
    });
  }
);
