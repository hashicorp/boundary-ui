import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/table/section', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Table::Section @tagName='tag' class='tag-class'/>`);
    assert.ok(find('tag'));
    assert.ok(find('.tag-class'));
  });

  test('it renders with attributes', async function (assert) {
    await render(hbs`<Rose::Table::section @tagName='tag' id="section"/>`);
    assert.ok(find('#section'));
  });

  test('it renders a row', async function (assert) {
    await render(hbs`<Rose::Table::Section @tagName='tag' as |section|>
      <section.row />
    </Rose::Table::Section>`);
    assert.ok(find('tr'));
    assert.ok(find('.rose-table-row'));
  });
});
