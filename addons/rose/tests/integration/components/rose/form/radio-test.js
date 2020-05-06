import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/form/radio', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`<Rose::Form::Radio />`);
    assert.ok(await find('input'));
    assert.equal(await find('input').type, 'radio');
  });

  test('it renders with label', async function(assert) {
    await render(hbs`<Rose::Form::Radio @label="Label"/>`);
    assert.equal(await find('label').textContent.trim(), 'Label');
  });

  test('it is not checked by default', async function(assert) {
    await render(hbs`<Rose::Form::Radio />`);
    assert.equal(await find('input').checked, false);
  });

  test('it is not disabled by default', async function(assert) {
    await render(hbs`<Rose::Form::Radio />`);
    assert.equal(await find('input').disabled, false);
  });

  test('it is not in error state by default', async function(assert) {
    await render(hbs`<Rose::Form::Radio />`);
    assert.notOk(await find('.error'));
  });

  test('it is checked when @checked={{true}}', async function(assert) {
    await render(hbs`<Rose::Form::Radio @checked={{true}}/>`);
    assert.equal(await find('input').checked, true);
  });

  test('it is disabled when disabled={{true}}', async function(assert) {
    await render(hbs`<Rose::Form::Radio disabled={{true}}/>`);
    assert.equal(await find('input').disabled, true);
  });

  test('it is in error state when @error={{true}}', async function(assert) {
    await render(hbs`<Rose::Form::Radio @error={{true}} />`);
    assert.ok(await find('.error'));
  });
});
