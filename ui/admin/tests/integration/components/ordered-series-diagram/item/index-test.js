/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
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
      assert.expect(2);

      await render(hbs`
        <OrderedSeriesDiagram::Item @icon='user'>
          Client
        </OrderedSeriesDiagram::Item>
      `);

      assert.dom('[data-test-icon="user"]').isVisible();
      assert.dom('.ordered-series-diagram-item-title').hasText('Client');
    });
  }
);
