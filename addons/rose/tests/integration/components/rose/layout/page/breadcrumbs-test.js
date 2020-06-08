import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/layout/page/breadcrumbs', function (
  hooks
) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Layout::Page::Breadcrumbs />`);
    assert.ok(find('div'));
    assert.ok(find('.rose-layout-page-breadcrumbs'));
  });

  test('it renders with attributes', async function (assert) {
    await render(hbs`<Rose::Layout::Page::Breadcrumbs id="breadcrumbs"/>`);
    assert.ok(find('#breadcrumbs'));
  });

  test('it renders with content', async function (assert) {
    await render(hbs`<Rose::Layout::Page::Breadcrumbs>
      <button id="content" />
    </Rose::Layout::Page::Breadcrumbs>`);
    assert.ok(find('#content'));
  });
});
