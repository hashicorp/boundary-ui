/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | branded-card', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<BrandedCard />`);

    assert.dom('.branded-card').isVisible();
    assert.dom('h1').exists();
    assert.dom('.branded-card-description').exists();
  });

  test('it renders with content', async function (assert) {
    await render(hbs`<BrandedCard
      @title="title"
      @description="description"
    />`);

    assert.dom('h1').hasText('title');
    assert.dom('.branded-card-description').hasText('description');
  });
});
