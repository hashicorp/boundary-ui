import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/layout/global/header', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Layout::Global::Header />`);
    assert.ok(find('header'));
    assert.ok(find('.rose-layout-global-header'));
  });

  test('it renders with attributes', async function (assert) {
    await render(hbs`<Rose::Layout::Global::Header id="header"/>`);
    assert.ok(find('#header'));
  });

  test('it renders with content', async function (assert) {
    await render(hbs`<Rose::Layout::Global::Header>
      <button id="content" />
    </Rose::Layout::Global::Header>`);
    assert.ok(find('#content'));
  });
});
