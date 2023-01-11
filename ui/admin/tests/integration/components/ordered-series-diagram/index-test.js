import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | ordered-series-diagram/index',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders two icon series', async function (assert) {
      assert.expect(4);
      await render(hbs`
      <OrderedSeriesDiagram as |d|>
        <d.item @icon='user' @arrow={{true}}>
          Client
        </d.item>
        <d.item @icon='settings' >
          Egress Worker
        </d.item>
      </OrderedSeriesDiagram>
    `);

      assert.dom('[data-test-icon="user"]').isVisible();
      assert
        .dom(
          '.ordered-series-diagram .orderd-series-diagram-item:first-child > span '
        )
        .hasText('Client');
      assert.dom('[data-test-icon="settings"]').isVisible();
      assert
        .dom(
          '.ordered-series-diagram .orderd-series-diagram-item:last-child > span '
        )
        .hasText('Egress Worker');
    });

    test('it renders icon and group series', async function (assert) {
      assert.expect(8);
      await render(hbs`
      <OrderedSeriesDiagram as |d|>
        <d.item @icon='user' @arrow={{true}}>
          Client
        </d.item>
        <d.group @title='Private Network' @highlight={{true}}>
          <d.item @icon='settings' @arrow={{true}}>
            Egress Worker
          </d.item>
          <d.item @icon='server' >
            Host
          </d.item>
        </d.group>
      </OrderedSeriesDiagram>
    `);

      assert.dom('[data-test-icon="user"]').isVisible();
      assert
        .dom('.ordered-series-diagram .ordered-series-diagram-item > span ')
        .hasText('Client');
      assert.dom('.ordered-series-diagram-group').hasClass('highlight');
      assert
        .dom('.ordered-series-diagram-group > span')
        .hasText('Private Network');
      assert.dom('[data-test-icon="settings"]').isVisible();
      assert
        .dom(
          '.ordered-series-diagram-group .ordered-series-diagram-item > span'
        )
        .hasText('Egress Worker');
      assert.dom('[data-test-icon="server"]').isVisible();
      assert
        .dom(
          '.ordered-series-diagram-group .ordered-series-diagram-item:last-child > span '
        )
        .hasText('Host');
    });
  }
);
