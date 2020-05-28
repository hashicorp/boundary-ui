import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/layout/page/header', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Layout::Page::Header />`);
    assert.ok(find('.rose-layout-header'));
  });

  test('it renders with attributes', async function (assert) {
    await render(hbs`<Rose::Layout::Page::Header id="header"/>`);
    assert.ok(find('#header'));
  });

  test('it renders with content', async function (assert) {
    await render(hbs`<Rose::Layout::Page::Header>
      <button id="content" />
    </Rose::Layout::Page::Header>`);
    assert.ok(find('#content'));
  });
});
