/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/layout/sidebar', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`
      <Rose::Layout::Sidebar as |layout|>
        <layout.sidebar />
        <layout.body />
        <layout.footer/>
      </Rose::Layout::Sidebar>
    `);
    assert.ok(find('.rose-layout-sidebar'));
    assert.ok(find('.rose-layout-sidebar-body'));
    assert.ok(find('aside.rose-layout-sidebar-sidebar'));
    assert.ok(find('.rose-layout-sidebar-footer'));
  });
});
