import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/table/cell', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Table::Cell />`);
    assert.ok(find('td'));
    assert.ok(find('.rose-table-cell'));
    assert.ok(find('.rose-table-body-cell'));
  });

  test('it renders with attributes', async function (assert) {
    await render(hbs`<Rose::Table::Cell id="cell"/>`);
    assert.ok(find('#cell'));
  });

  test('it renders with content', async function (assert) {
    await render(hbs`<Rose::Table::Cell>
      Cell content
    </Rose::Table::Cell>`);
    assert.equal(find('.rose-table-cell').textContent.trim(), 'Cell content');
  });

  test('it renders as header cell', async function (assert) {
    await render(hbs`<Rose::Table::Cell @header={{true}}/>`);
    assert.ok(find('.rose-table-cell'));
    assert.ok(find('.rose-table-header-cell'));
  });

  test('it renders as footer cell', async function (assert) {
    await render(hbs`<Rose::Table::Cell @footer={{true}}/>`);
    assert.ok(find('.rose-table-cell'));
    assert.ok(find('.rose-table-footer-cell'));
  });
});
