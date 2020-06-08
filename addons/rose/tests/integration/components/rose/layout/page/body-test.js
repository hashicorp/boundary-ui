import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/layout/page/body', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Layout::Page::Body />`);
    assert.ok(find('div'));
    assert.ok(find('.rose-layout-page-body'));
  });

  test('it renders with attributes', async function (assert) {
    await render(hbs`<Rose::Layout::Page::Body id="body"/>`);
    assert.ok(find('#body'));
  });

  test('it renders with content', async function (assert) {
    await render(hbs`<Rose::Layout::Page::Body>
      <button id="content" />
    </Rose::Layout::Page::Body>`);
    assert.ok(find('#content'));
  });
});
