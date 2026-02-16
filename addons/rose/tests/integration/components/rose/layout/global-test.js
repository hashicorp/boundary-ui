/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/layout/global', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Layout::Global />`);
    assert.ok(find('section'));
    assert.ok(find('.rose-layout-global'));
  });

  test('it renders with attributes', async function (assert) {
    await render(hbs`<Rose::Layout::Global id="global"/>`);
    assert.ok(find('#global'));
  });

  test('it renders with header', async function (assert) {
    await render(hbs`<Rose::Layout::Global as |layout|>
      <layout.header />
    </Rose::Layout::Global>`);
    assert.ok(find('.rose-layout-global-header'));
  });

  test('it renders with body', async function (assert) {
    await render(hbs`<Rose::Layout::Global as |layout|>
      <layout.body />
    </Rose::Layout::Global>`);
    assert.ok(find('.rose-layout-global-body'));
  });

  test('it renders with footer', async function (assert) {
    await render(hbs`<Rose::Layout::Global as |layout|>
      <layout.footer />
    </Rose::Layout::Global>`);
    assert.ok(find('.rose-layout-global-footer'));
  });
});
