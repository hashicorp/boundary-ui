import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/layout/page/actions', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Layout::Page::Actions />`);
    assert.ok(find('div'));
    assert.ok(find('.rose-layout-page-actions'));
  });

  test('it renders with attributes', async function (assert) {
    await render(hbs`<Rose::Layout::Page::Actions id="actions"/>`);
    assert.ok(find('#actions'));
  });

  test('it renders with content', async function (assert) {
    await render(hbs`<Rose::Layout::Page::Actions>
      <button id="content" />
    </Rose::Layout::Page::Actions>`);
    assert.ok(find('#content'));
  });
});
