/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/nav/breadcrumbs', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Nav::Breadcrumbs />`);
    assert.ok(find('.rose-nav-breadcrumbs'));
  });

  test('it renders with attributes', async function (assert) {
    await render(hbs`<Rose::Nav::Breadcrumbs id="breadcrumbs"/>`);
    assert.ok(find('#breadcrumbs'));
  });

  test('it renders with breadcrumb links', async function (assert) {
    await render(hbs`<Rose::Nav::Breadcrumbs as |breadcrumbs|>
      <breadcrumbs.link @route="index" />
      <breadcrumbs.link @route="index" />
    </Rose::Nav::Breadcrumbs>`);
    assert.strictEqual(findAll('.rose-nav-link').length, 2);
  });
});
