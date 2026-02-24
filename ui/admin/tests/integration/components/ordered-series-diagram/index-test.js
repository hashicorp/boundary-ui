/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | ordered-series-diagram/index',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders two icon series', async function (assert) {
      this.set('client', 'Client');
      this.set('egressWorker', 'Egress Worker');

      await render(hbs`
      <OrderedSeriesDiagram as |D|>
        <D.Item @icon='user'>{{this.client}}</D.Item>
        <D.Item @icon='settings'>{{this.egressWorker}}</D.Item>
      </OrderedSeriesDiagram>
    `);

      assert.dom('[data-test-icon="user"]').isVisible();
      assert.dom('.ordered-series-diagram-item-title').hasText('Client');
      assert.dom('[data-test-icon="arrow-right"]').isVisible();
      assert.dom('[data-test-icon="settings"]').isVisible();
      assert
        .dom(
          '.ordered-series-diagram-item:last-child .ordered-series-diagram-item-title',
        )
        .hasText('Egress Worker');
    });
  },
);
