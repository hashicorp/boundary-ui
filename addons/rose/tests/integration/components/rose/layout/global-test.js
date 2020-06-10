import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/layout/global', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Layout::Global />`);
    assert.ok(find('div'));
    assert.ok(find('.rose-layout-global'));
  });

  test('it renders with attributes', async function (assert) {
    await render(hbs`<Rose::Layout::Global id="global"/>`);
    assert.ok(find('#global'));
  });

  test('it renders with content', async function (assert) {
    await render(hbs`<Rose::Layout::Global as |layout|>
      <button id="content" />
    </Rose::Layout::Global>`);
    assert.ok(find('#content'));
  });

  test('it renders with header', async function (assert) {
    await render(hbs`<Rose::Layout::Global as |layout|>
      <layout.header />
    </Rose::Layout::Global>`);
    assert.ok(find('.rose-layout-global-header'));
  });

  test('it renders with main', async function (assert) {
    await render(hbs`<Rose::Layout::Global as |layout|>
      <layout.body />
    </Rose::Layout::Global>`);
    assert.ok(find('.rose-layout-global-body'));
  });

  test('it renders with sidebar', async function (assert) {
    await render(hbs`<Rose::Layout::Global as |layout|>
      <layout.sidebar />
    </Rose::Layout::Global>`);
    assert.ok(find('.rose-layout-global-sidebar'));
  });
});
