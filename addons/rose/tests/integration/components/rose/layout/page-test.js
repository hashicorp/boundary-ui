/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/layout/page', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Layout::Page />`);
    assert.ok(find('div'));
    assert.ok(find('.rose-layout-page'));
  });

  test('it renders with attributes', async function (assert) {
    await render(hbs`<Rose::Layout::Page id="page"/>`);
    assert.ok(find('#page'));
  });

  test('it renders with content', async function (assert) {
    await render(hbs`<Rose::Layout::Page>
      <button id="content" type="button" />
    </Rose::Layout::Page>`);
    assert.ok(find('#content'));
  });
});
