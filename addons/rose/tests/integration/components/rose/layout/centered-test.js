/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/layout/centered', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Layout::Centered />`);
    assert.ok(find('section'));
    assert.ok(find('.rose-layout-centered'));
    assert.notOk(find('.rose-layout-centered-body'));
  });

  test('it renders with attributes', async function (assert) {
    await render(hbs`<Rose::Layout::Centered id="layout"/>`);
    assert.ok(find('#layout'));
  });

  test('it renders with content', async function (assert) {
    await render(hbs`<Rose::Layout::Centered>
      Layout content
    </Rose::Layout::Centered>`);
    assert.strictEqual(
      find('.rose-layout-centered').textContent.trim(),
      'Layout content',
    );
  });
});
