import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | ordered-series-diagram/group/index',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders group icons with highlight background', async function (assert) {
      assert.expect(6);

      await render(hbs`
      <OrderedSeriesDiagram::Group @title='Private Network' @highlight={{true}}>
        <OrderedSeriesDiagram::Item @icon='user' @arrow={{true}}>
          Client
        </OrderedSeriesDiagram::Item>
        <OrderedSeriesDiagram::Item @icon='settings'>
          Egress Worker
        </OrderedSeriesDiagram::Item>
      </OrderedSeriesDiagram::Group>
    `);

      assert.dom('.ordered-series-diagram-group').hasClass('highlight');
      assert
        .dom('.ordered-series-diagram-group > span')
        .hasText('Private Network');
      assert.dom('[data-test-icon="user"]').isVisible();
      assert
        .dom(
          '.ordered-series-diagram-group .ordered-series-diagram-item > span'
        )
        .hasText('Client');
      assert.dom('[data-test-icon="settings"]').isVisible();
      assert
        .dom(
          '.ordered-series-diagram-group .ordered-series-diagram-item:last-child > span'
        )
        .hasText('Egress Worker');
    });
  }
);
