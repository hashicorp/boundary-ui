import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/table/footer', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Table::Footer />`);
    assert.ok(find('tfoot'));
    assert.ok(find('.rose-table-footer'));
  });

  test('it renders with attributes', async function (assert) {
    await render(hbs`<Rose::Table::Footer id="footer"/>`);
    assert.ok(find('#footer'));
  });

  test('it renders with row', async function (assert) {
    await render(hbs`<Rose::Table::Footer as |footer|>
      <footer.row />
    </Rose::Table::Footer>`);
    assert.ok(find('tr'));
  });

  test('it renders with row cell', async function (assert) {
    await render(hbs`<Rose::Table::Footer as |footer|>
      <footer.row as |row|>
        <row.cell />
      </footer.row>
    </Rose::Table::Footer>`);
    assert.ok(find('td'));
    assert.ok(find('.rose-table-cell'));
  });
});
