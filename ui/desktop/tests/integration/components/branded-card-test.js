/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Integration | Component | branded-card', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    setRunOptions({
      rules: {
        'empty-heading': {
          // [ember-a11y-ignore]: axe rule "empty-heading" automatically ignored on 2025-07-25T20:27:26.009Z
          enabled: false,
        },
      },
    });

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
