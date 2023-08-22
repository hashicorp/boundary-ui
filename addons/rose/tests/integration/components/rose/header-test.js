/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/header', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Header />`);
    assert.ok(find('.rose-header'));
  });

  test('it renders with brand', async function (assert) {
    await render(hbs`<Rose::Header as |header| >
      <header.brand></header.brand>
    </Rose::Header>`);
    assert.ok(find('.rose-header-brand'));
    assert.notOk(find('.rose-header-nav'));
    assert.notOk(find('.rose-header-utilities'));
  });

  test('it renders with nav', async function (assert) {
    await render(hbs`<Rose::Header as |header| >
      <header.nav />
    </Rose::Header>`);
    assert.ok(find('.rose-header-nav'));
    assert.notOk(find('.rose-header-brand'));
    assert.notOk(find('.rose-header-utilities'));
  });

  test('it renders with nav elements', async function (assert) {
    await render(hbs`<Rose::Header as |header| >
      <header.nav as |nav|>
        <nav.dropdown @text='org-name' as |dropdown|>
          <dropdown.link @route='index'>Menu item</dropdown.link>
          <dropdown.link @route='about'>Menu item</dropdown.link>
          <dropdown.button>Button menu item</dropdown.button>
        </nav.dropdown>
      </header.nav>
    </Rose::Header>`);
    assert.ok(find('.rose-dropdown'));
  });

  test('it renders with utilities', async function (assert) {
    await render(hbs`<Rose::Header as |header| >
      <header.utilities />
    </Rose::Header>`);
    assert.notOk(find('.rose-header-brand'));
    assert.notOk(find('.rose-header-nav'));
    assert.ok(find('.rose-header-utilities'));
  });

  test('it renders with utility elements', async function (assert) {
    await render(hbs`<Rose::Header as |header| >
      <header.utilities as |utility| >
        <utility.dropdown />
      </header.utilities>
    </Rose::Header>`);
    assert.ok(find('.rose-dropdown'));
  });
});
