/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/dropdown', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Dropdown />`);
    assert.ok(find('.rose-dropdown'));
    assert.notOk(find('.rose-dropdown-right'));
  });

  test('it renders with html attributes', async function (assert) {
    await render(hbs`<Rose::Dropdown id="custom-id" class="custom-class"/>`);
    assert.ok(find('#custom-id'));
    assert.ok(find('.custom-class'));
  });

  test('it renders with trigger', async function (assert) {
    await render(hbs`<Rose::Dropdown @text="Click me" />`);
    assert.strictEqual(
      find('.rose-dropdown-trigger').textContent.trim(),
      'Click me',
    );
  });

  test('it supports a count', async function (assert) {
    await render(hbs`<Rose::Dropdown @text="Click me" @count="2" />`);
    assert.strictEqual(find('.hds-badge-count').textContent.trim(), '2');
  });

  test('it supports an icon', async function (assert) {
    await render(hbs`<Rose::Dropdown @icon="user-circle" />`);
    assert.dom('svg').isVisible();
  });

  test('it supports icon-only display', async function (assert) {
    await render(hbs`<Rose::Dropdown @iconOnly={{true}} />`);
    assert.ok(find('.has-icon-only'));
  });

  test('it supports right aligned content', async function (assert) {
    await render(hbs`
      <Rose::Dropdown @dropdownRight={{true}} />
    `);
    assert.ok(find('.rose-dropdown-right'));
  });

  test('it supports hiding dropdown caret', async function (assert) {
    await render(hbs`<Rose::Dropdown />`);
    assert.ok(find('.show-caret'));

    await render(hbs`<Rose::Dropdown @showCaret={{false}}/>`);
    assert.notOk(find('.show-caret'));
  });

  test('it renders with content', async function (assert) {
    await render(hbs`<Rose::Dropdown @text="Click me" as |dropdown|>
      <dropdown.link @route="about"/>
      <dropdown.link @route="about"/>
      <dropdown.button />
      <dropdown.button />
      <dropdown.button />
    </Rose::Dropdown>`);
    assert.ok(find('.rose-dropdown-content'));
    assert.strictEqual(findAll('a').length, 2);
    assert.strictEqual(findAll('button').length, 3);
  });

  test('it is toggled on click on trigger content', async function (assert) {
    await render(hbs`<Rose::Dropdown id="dropdown" />`);

    assert.notOk(find('#dropdown').open);
    await click('summary');
    assert.ok(find('#dropdown').open);
    await click('summary');
    assert.notOk(find('#dropdown').open);
  });

  test('it is closed with outside click is triggered', async function (assert) {
    await render(hbs`
      <div id="wrapper">
        <Rose::Dropdown id="dropdown" />
      </div>
    `);

    await click('summary');
    assert.ok(find('#dropdown').open);
    await click('#wrapper');
    assert.notOk(find('#dropdown').open);
  });

  test('it is closed when inside content is clicked', async function (assert) {
    await render(hbs`
      <Rose::Dropdown as |dropdown|>
        <dropdown.button>Button</dropdown.button>
      </Rose::Dropdown>
    `);

    await click('summary');
    assert.ok(find('.rose-dropdown').open);
    await click('button');
    assert.notOk(find('.rose-dropdown').open);
  });
});
