import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/page-header/utilities', function (
  hooks
) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::PageHeader::Utilities />`);
    assert.ok(find('.rose-page-header-utilities'));
  });

  test('it renders with attributes', async function (assert) {
    await render(hbs`<Rose::PageHeader::Utilities id="utilities"/>`);
    assert.ok(find('#utilities'));
  });

  test('it renders with content', async function (assert) {
    await render(
      hbs`<Rose::PageHeader::Utilities>Page header utilities</Rose::PageHeader::Utilities>`
    );
    assert.equal(
      find('.rose-page-header-utilities').textContent.trim(),
      'Page header utilities'
    );
  });

  test('it renders utility action buttons', async function (assert) {
    await render(hbs`<Rose::PageHeader::Utilities as |utility|>
      <utility.action />
      <utility.action />
    </Rose::PageHeader::Utilities>`);
    assert.equal(findAll('button').length, 2);
  });
});
