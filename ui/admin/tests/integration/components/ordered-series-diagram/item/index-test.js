/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module(
  'Integration | Component | ordered-series-diagram/item/index',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders with icon and text', async function (assert) {
      setRunOptions({
        rules: {
          listitem: {
            // [ember-a11y-ignore]: axe rule "listitem" automatically ignored on 2025-07-25T21:48:17.047Z
            enabled: false,
          },
        },
      });

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
