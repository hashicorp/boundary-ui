import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | ordered-series-diagram/group/index',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders group icons with highlight background', async function (assert) {
      assert.expect(7);

      await render(hbs`
        <OrderedSeriesDiagram::Group @title='Private Network' @color='highlight'>
          <OrderedSeriesDiagram::Item @icon='user'>
            Client
          </OrderedSeriesDiagram::Item>
          <OrderedSeriesDiagram::Item @icon='settings'>
            Egress Worker
          </OrderedSeriesDiagram::Item>
        </OrderedSeriesDiagram::Group>
      `);

      assert
        .dom('.ordered-series-diagram-group-content')
        .hasClass('hds-surface-highlight');
      assert
        .dom('.ordered-series-diagram-group-title')
        .hasText('Private Network');
      assert.dom('[data-test-icon="user"]').isVisible();
      assert.dom('[data-test-icon="arrow-right"]').isVisible();
      assert
        .dom('.ordered-series-diagram-item .ordered-series-diagram-item-title')
        .hasText('Client');
      assert.dom('[data-test-icon="settings"]').isVisible();
      assert
        .dom(
          '.ordered-series-diagram-item:last-child .ordered-series-diagram-item-title'
        )
        .hasText('Egress Worker');
    });
  }
);
