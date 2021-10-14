import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/dropdown/checkbox', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Dropdown::Checkbox />`);
    assert.ok(find('input'));
    assert.ok(find('.rose-dropdown-button'));
  });

  test('it is disabled when @disabled={{true}}', async function (assert) {
    await render(hbs`<Rose::Dropdown::Checkbox @disabled={{true}} />`);
    assert.equal(find('input').disabled, true);
  });

  test('it is of type="checkbox"', async function (assert) {
    await render(hbs`<Rose::Dropdown::Checkbox />`);
    assert.equal(find('input').type, 'checkbox');
  });
});
