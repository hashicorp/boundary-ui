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
    await render(hbs`<Rose::Layout::Page>
      <button id="content" />
    </Rose::Layout::Page>`);
    assert.ok(find('#content'));
  });
});
