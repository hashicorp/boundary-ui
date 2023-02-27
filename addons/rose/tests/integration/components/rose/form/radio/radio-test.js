/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/form/radio/radio', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Form::Radio::Radio />`);
    assert.ok(await find('input'));
    assert.strictEqual(await find('input').type, 'radio');
  });

  test('it renders with label', async function (assert) {
    await render(hbs`<Rose::Form::Radio::Radio @label="Label"/>`);
    assert.strictEqual(await find('label').textContent.trim(), 'Label');
  });

  test('it supports an icon', async function (assert) {
    await render(
      hbs`<Rose::Form::Radio::Radio @icon="flight-icons/svg/user-circle-16" />`
    );
    assert.ok(find('svg'));
  });

  test('it is checked when @value and @selectedValue values match', async function (assert) {
    await render(
      hbs`<Rose::Form::Radio::Radio @value="tree" @selectedValue="tree"/>`
    );
    assert.true(await find('input').checked);
  });

  test('it is not checked when @value and @selectedValue values are different', async function (assert) {
    await render(hbs`<Rose::Form::Radio::Radio @value="tree"/>`);
    assert.false(await find('input').checked);

    await render(hbs`<Rose::Form::Radio::Radio @selectedValue="tree"/>`);
    assert.false(await find('input').checked);

    await render(
      hbs`<Rose::Form::Radio::Radio @value="root" @selectedValue="tree"/>`
    );
    assert.false(await find('input').checked);
  });

  test('it is not disabled by default', async function (assert) {
    await render(hbs`<Rose::Form::Radio::Radio />`);
    assert.false(await find('input').disabled);
  });

  test('it is not in error state by default', async function (assert) {
    await render(hbs`<Rose::Form::Radio::Radio />`);
    assert.notOk(await find('.error'));
  });

  test('it is disabled when @disabled={{true}}', async function (assert) {
    await render(hbs`<Rose::Form::Radio::Radio @disabled={{true}}/>`);
    assert.true(await find('input').disabled);
  });

  test('it is in error state when @error={{true}}', async function (assert) {
    await render(hbs`<Rose::Form::Radio::Radio @error={{true}} />`);
    assert.ok(await find('.error'));
  });
});
