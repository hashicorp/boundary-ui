/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/button', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Button>Button</Rose::Button>`);
    assert.strictEqual(this.element.textContent.trim(), 'Button');
  });

  test('it is type="button" by default', async function (assert) {
    await render(hbs`<Rose::Button>Button</Rose::Button>`);
    assert.strictEqual(find('button').type, 'button');
  });

  test('it is type="submit" when @onSubmit={{true}}', async function (assert) {
    await render(hbs`<Rose::Button @onSubmit={{true}} />`);
    assert.strictEqual(find('button').type, 'submit');
  });

  test('it is disabled when @disabled={{true}}', async function (assert) {
    await render(hbs`<Rose::Button @disabled={{true}} />`);
    assert.true(find('button').disabled);
  });

  test('it adds a style class', async function (assert) {
    await render(hbs`<Rose::Button @style="primary" />`);
    assert.ok(find('.rose-button-primary'));
    await render(hbs`<Rose::Button @style="secondary" />`);
    assert.ok(find('.rose-button-secondary'));
  });

  test('it supports left and right icons', async function (assert) {
    await render(hbs`<Rose::Button @iconLeft="chevron-left" />`);
    assert.dom('.has-icon-left .hds-icon').isVisible();
    await render(hbs`<Rose::Button @iconRight="chevron-left" />`);
    assert.dom('.has-icon-right .hds-icon').isVisible();
  });

  test('it supports an icon-only type', async function (assert) {
    await render(hbs`<Rose::Button @iconOnly="chevron-left" />`);
    assert.dom('.has-icon-only .hds-icon').isVisible();
  });
});
