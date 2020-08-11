import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/table/header', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Table::Header />`);
    assert.ok(find('thead'));
    assert.ok(find('.rose-table-header'));
  });

  test('it renders with attributes', async function (assert) {
    await render(hbs`<Rose::Table::Header id="header"/>`);
    assert.ok(find('#header'));
  });

  test('it renders with row', async function (assert) {
    await render(hbs`<Rose::Table::Header as |header|>
      <header.row />
    </Rose::Table::Header>`);
    assert.ok(find('tr'));
  });
});
