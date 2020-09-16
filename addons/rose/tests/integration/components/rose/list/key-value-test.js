import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/list/key-value', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(2);
    await render(hbs`
      <Rose::List::KeyValue as |list|>
        <list.item as |item|>
          <item.key>Key</item.key>
          <item.cell>Value</item.cell>
        </list.item>
        <list.item as |item|>
          <item.key>Key</item.key>
          <item.cell>Value</item.cell>
        </list.item>
      </Rose::List::KeyValue>
    `);
    const itemLabelledBy = find(
      '.rose-list-key-value-item:first-child'
    ).getAttribute('aria-labelledby');
    assert.equal(
      findAll('.rose-list-key-value-item').length,
      2,
      'it has two items'
    );
    assert.ok(
      find(
        `.rose-list-key-value-item:first-child > .rose-list-key-value-item-cell:first-child#${itemLabelledBy}`
      ),
      'The key cell has an ID associated with the `aria-labelledby` attribute of its parent item element'
    );
  });
});
