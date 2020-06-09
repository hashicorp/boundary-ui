import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/table/body', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Table::Body />`);
    assert.ok(find('tbody'));
    assert.ok(find('.rose-table-body'));
  });

  test('it renders with attributes', async function (assert) {
    await render(hbs`<Rose::Table::Body id="body"/>`);
    assert.ok(find('#body'));
  });

  test('it renders with row', async function (assert) {
    await render(hbs`<Rose::Table::Body as |body|>
      <body.row />
    </Rose::Table::Body>`);
    assert.ok(find('tr'));
  });

  test('it renders with row cell', async function (assert) {
    await render(hbs`<Rose::Table::Body as |body|>
      <body.row as |row|>
        <row.cell />
      </body.row>
    </Rose::Table::Body>`);
    assert.ok(find('td'));
    assert.ok(find('.rose-table-body-cell'));
  });
});
