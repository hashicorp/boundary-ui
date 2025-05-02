/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/frame', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`
      <Rose::Frame>
        <:header>Header</:header>
        <:body>Body</:body>
      </Rose::Frame>
    `);

    assert.dom('.hds-card__container > header').isVisible();
    assert.dom('.hds-card__container > div').isVisible();
  });
});
