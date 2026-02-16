/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | ordered-series-diagram/group/index',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders group icons with highlight background', async function (assert) {
      this.set('client', 'Client');
      this.set('egressWorker', 'Egress Worker');

      await render(hbs`
      <OrderedSeriesDiagram::Group @title='Private Network' @color='highlight'>
        <OrderedSeriesDiagram::Item @icon='user'>
          {{this.client}}
        </OrderedSeriesDiagram::Item>
        <OrderedSeriesDiagram::Item @icon='settings'>
          {{this.egressWorker}}
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
          '.ordered-series-diagram-item:last-child .ordered-series-diagram-item-title',
        )
        .hasText('Egress Worker');
    });
  },
);
