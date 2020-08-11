import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/table/row', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Table::Row />`);
    assert.ok(find('tr'));
    assert.ok(find('.rose-table-row'));
  });

  test('it renders with attributes', async function (assert) {
    await render(hbs`<Rose::Table::Row id="row"/>`);
    assert.ok(find('#row'));
  });

  test('it renders a cell', async function (assert) {
    await render(hbs`<Rose::Table::Row as |row|>
      <row.cell />
    </Rose::Table::Row>`);
    assert.ok(find('td'));
    assert.ok(find('.rose-table-cell'));
  });

  test('it renders a header cell', async function (assert) {
    await render(hbs`<Rose::Table::Row @header={{true}} as |row|>
      <row.cell />
    </Rose::Table::Row>`);
    assert.ok(find('th'));
    assert.notOk(find('td'));
    assert.ok(find('.rose-table-cell'));
    assert.ok(find('.rose-table-header-cell'));
  });
});
