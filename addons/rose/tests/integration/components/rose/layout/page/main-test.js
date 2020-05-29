import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/layout/page/main', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Layout::Page::Main />`);
    assert.ok(find('main'));
    assert.ok(find('.rose-layout-main'));
  });

  test('it renders with attributes', async function (assert) {
    await render(hbs`<Rose::Layout::Page::Main id="main"/>`);
    assert.ok(find('#main'));
  });

  test('it renders with content', async function (assert) {
    await render(hbs`<Rose::Layout::Page::Main>
      <button id="content" />
    </Rose::Layout::Page::Main>`);
    assert.ok(find('#content'));
  });
});
