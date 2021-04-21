import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/list/value', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(1);
    await render(hbs`
      <Rose::List::Value as |list|>
        <list.item as |item|>
          <item.cell>Value</item.cell>
        </list.item>
        <list.item as |item|>
          <item.cell>Value</item.cell>
        </list.item>
      </Rose::List::Value>
    `);
    assert.equal(
      findAll('.rose-list-value-item').length,
      2,
      'it has two items'
    );
  });
});
