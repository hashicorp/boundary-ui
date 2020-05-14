import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/dropdown/item', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Dropdown as |dropdown|>
      <dropdown.option>Dropdown Item</dropdown.option>
    </Rose::Dropdown>`);

    await click(find('.rose-dropdown-label'));
    assert.ok(await find('.rose-dropdown-item'));
    assert.equal(
      await find('.rose-dropdown-item').textContent.trim(),
      'Dropdown Item'
    );
  });
});
