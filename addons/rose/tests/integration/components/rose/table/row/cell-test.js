import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/table/row/cell', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(2);
    await render(hbs`<Rose::Table::Row::Cell>
      content
    </Rose::Table::Row::Cell>`);
    assert.ok(find('td'));
    assert.equal(find('.rose-table-cell').textContent.trim(), 'content');
  });

  test('it renders with attributes', async function (assert) {
    assert.expect(1);
    await render(hbs`<Rose::Table::Row::Cell id="cell"/>`);
    assert.ok(find('#cell'));
  });

  test('it renders as header cell', async function (assert) {
    assert.expect(4);
    await render(hbs`<Rose::Table::Row::Cell @tagName='th'/>`);
    assert.ok(find('th'));
    assert.ok(find('.rose-table-header-cell'));
    assert.notOk(find('td'));
    assert.notOk(find('.rose-table-cell'));
  });

  test('it adds shrink style class', async function (assert) {
    assert.expect(1);
    await render(hbs`<Rose::Table::Row::Cell @shrink={{true}} />`);
    assert.ok(find('.rose-table-cell-shrink'));
  });

  test('it does not add expand style class in default cells', async function (assert) {
    assert.expect(1);
    await render(hbs`<Rose::Table::Row::Cell />`);
    assert.notOk(find('.rose-table-cell-shrink'));
  });

  test('it renders with align center in a header cell', async function (assert) {
    assert.expect(2);
    await render(
      hbs`<Rose::Table::Row::Cell @tagName='th' @alignCenter=true />`
    );
    assert.ok(find('.rose-table-header-cell'));
    assert.ok(find('.align-center'));
  });

  test('it renders with align center in a body', async function (assert) {
    assert.expect(2);
    await render(hbs`<Rose::Table::Row::Cell @alignCenter=true />`);
    assert.ok(find('.rose-table-cell'));
    assert.ok(find('.align-center'));
  });

  test('it renders with align right in a header cell', async function (assert) {
    assert.expect(2);
    await render(
      hbs`<Rose::Table::Row::Cell @tagName='th' @alignRight=true />`
    );
    assert.ok(find('.rose-table-header-cell'));
    assert.ok(find('.align-right'));
  });

  test('it renders with align right', async function (assert) {
    assert.expect(2);
    await render(hbs`<Rose::Table::Row::Cell @alignRight=true />`);
    assert.ok(find('.rose-table-cell'));
    assert.ok(find('.align-right'));
  });
});
