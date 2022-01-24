import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/form/radio/card', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Form::Radio::Card />`);
    assert.ok(await find('input'));
    assert.equal(await find('input').type, 'radio');
  });

  test('it renders in a tile format when tile layout is applied', async function (assert) {
    await render(hbs`<Rose::Form::Radio::Card @layout="tile"/>`);
    assert.ok(await find('.rose-form-radio-card-tile'));
  });

  test('it supports an icon', async function (assert) {
    await render(
      hbs`<Rose::Form::Radio::Card @icon="flight-icons/svg/user-circle-16" />`
    );
    assert.ok(find('svg'));
  });

  test('it is checked when @value and @selectedValue values match', async function (assert) {
    await render(
      hbs`<Rose::Form::Radio::Card @value="tree" @selectedValue="tree"/>`
    );
    assert.true(await find('input').checked);
  });

  test('it is not disabled by default', async function (assert) {
    await render(hbs`<Rose::Form::Radio::Card />`);
    assert.false(await find('input').disabled);
  });

  test('it is not in error state by default', async function (assert) {
    await render(hbs`<Rose::Form::Radio::Card />`);
    assert.notOk(await find('.error'));
  });

  test('it is disabled when @disabled={{true}}', async function (assert) {
    await render(hbs`<Rose::Form::Radio::Card @disabled={{true}}/>`);
    assert.true(await find('input').disabled);
  });

  test('it is in error state when @error={{true}}', async function (assert) {
    await render(hbs`<Rose::Form::Radio::Card @error={{true}} />`);
    assert.ok(await find('.error'));
  });
});
