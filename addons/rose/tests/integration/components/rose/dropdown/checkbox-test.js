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

  test.skip('it is disabled when @disabled={{true}}', async function (assert) {
    await render(hbs`<Rose::Dropdown::Checkbox @disabled={{true}} />`);
    assert.equal(find('button').disabled, true);
  });

  test.skip('it is of type="checkbox"', async function (assert) {
    await render(hbs`<Rose::Dropdown::Checkbox />`);
    assert.equal(find('checkbox').type, 'checkbox');
  });
});
