/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
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

  test('it renders with utilities', async function (assert) {
    await render(hbs`<Rose::Header as |header| >
      <header.utilities />
    </Rose::Header>`);
    assert.notOk(find('.rose-header-brand'));
    assert.notOk(find('.rose-header-nav'));
    assert.ok(find('.rose-header-utilities'));
  });

  test('it renders the hds dropdown within header utilities', async function (assert) {
    await render(hbs`<Rose::Header as |header| >
      <header.utilities>
        <Hds::Dropdown as |D|>
          <D.ToggleButton @text="Menu" />
        </Hds::Dropdown>  
      </header.utilities>
    </Rose::Header>`);
    assert.ok(find('.hds-dropdown'));
  });
});
