/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/nav/sidebar', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(2);
    await render(hbs`
      <Rose::Nav::Sidebar @title="Title" as |nav|>
        <nav.link @route="index">Item Name</nav.link>
      </Rose::Nav::Sidebar>
    `);
    assert.strictEqual(find('.rose-nav-title').textContent.trim(), 'Title');
    assert.strictEqual(find('.rose-nav-link').textContent.trim(), 'Item Name');
  });

  test('it associates title with nav via aria-labelledby', async function (assert) {
    assert.expect(2);
    await render(hbs`
      <Rose::Nav::Sidebar @title="Title" as |nav|>
        <nav.link @route="index">Item Name</nav.link>
      </Rose::Nav::Sidebar>
    `);
    const el = find('.rose-nav-sidebar');
    const id = el.id;
    const titleId = `title-${id}`;
    assert.strictEqual(find('.rose-nav-title').id, titleId);
    assert.strictEqual(el.getAttribute('aria-labelledby').trim(), titleId);
  });
});
