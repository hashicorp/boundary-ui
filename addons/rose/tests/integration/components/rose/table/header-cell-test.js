import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/table/header-cell', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders a header cell', async function (assert) {
    await render(hbs`<Rose::Table::HeaderCell/>`);
    assert.ok(find('th'));
    assert.ok(find('.rose-table-cell'));
    assert.ok(find('.rose-table-header-cell'));
  });

  test('it renders with attributes', async function (assert) {
    await render(hbs`<Rose::Table::HeaderCell id="header"/>`);
    assert.ok(find('#header'));
  });

  test('it renders with content', async function (assert) {
    await render(hbs`<Rose::Table::HeaderCell>
      Header content
    </Rose::Table::HeaderCell>`);
    assert.equal(find('.rose-table-cell').textContent.trim(), 'Header content');
  });

  test('it supports left and right icons', async function (assert) {
    await render(hbs`<Rose::Table::HeaderCell @iconLeft="chevron-left" @iconRight="chevron-right"/>`);
    assert.equal(findAll('.rose-icon').length, 2);
  });
});
