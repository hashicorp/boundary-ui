import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/table/row', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Table::Row @tagName='tag'/>`);
    assert.ok(find('tag'));
  });

  test('it renders with attributes', async function (assert) {
    await render(hbs`<Rose::Table::Row  @tagName='tag' id="row"/>`);
    assert.ok(find('#row'));
  });

  test('it renders a cell', async function (assert) {
    await render(hbs`<Rose::Table::Row @tagName='tr' @cellTagName='td' as |row|>
      <row.cell />
    </Rose::Table::Row>`);
    assert.ok(find('td'));
    assert.ok(find('.rose-table-cell'));
  });
});
