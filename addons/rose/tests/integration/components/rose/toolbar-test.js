/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/toolbar', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Toolbar />`);
    assert.ok(find('.rose-toolbar'));
  });

  test('it renders with attributes', async function (assert) {
    await render(hbs`<Rose::Toolbar id="toolbar"/>`);
    assert.ok(find('#toolbar'));
  });
});
