import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/layout/page', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Layout::Page />`);
    assert.ok(find('div'));
    assert.ok(find('.rose-layout-page'));
  });

  test('it renders with attributes', async function (assert) {
    await render(hbs`<Rose::Layout::Page id="page"/>`);
    assert.ok(find('#page'));
  });

  test('it renders with content', async function (assert) {
    await render(hbs`<Rose::Layout::Page as |page|>
      <button id="content" />
    </Rose::Layout::Page>`);
    assert.ok(find('#content'));
  });

  test('it renders with header', async function (assert) {
    await render(hbs`<Rose::Layout::Page as |page|>
      <page.header />
    </Rose::Layout::Page>`);
    assert.ok(find('.rose-layout-header'));
  });

  test('it renders with main', async function (assert) {
    await render(hbs`<Rose::Layout::Page as |page|>
      <page.main />
    </Rose::Layout::Page>`);
    assert.ok(find('.rose-layout-main'));
  });

  test('it renders with sidebar', async function (assert) {
    await render(hbs`<Rose::Layout::Page as |page|>
      <page.sidebar />
    </Rose::Layout::Page>`);
    assert.ok(find('.rose-layout-sidebar'));
  });
});
