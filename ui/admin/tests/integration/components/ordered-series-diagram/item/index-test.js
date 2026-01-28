/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | ordered-series-diagram/item/index',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders with icon and text', async function (assert) {
      this.set('client', 'Client');

      await render(hbs`
      <OrderedSeriesDiagram::Item @icon='user'>
        {{this.client}}
      </OrderedSeriesDiagram::Item>
    `);

      assert.dom('[data-test-icon="user"]').isVisible();
      assert.dom('.ordered-series-diagram-item-title').hasText('Client');
    });
  },
);
