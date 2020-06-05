import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/layout/global/body', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Layout::Global::Body />`);
    assert.ok(find('main'));
    assert.ok(find('.rose-layout-global-body'));
  });

  test('it renders with attributes', async function (assert) {
    await render(hbs`<Rose::Layout::Global::Body id="main"/>`);
    assert.ok(find('#main'));
  });

  test('it renders with content', async function (assert) {
    await render(hbs`<Rose::Layout::Global::Body>
      <button id="content" />
    </Rose::Layout::Global::Body>`);
    assert.ok(find('#content'));
  });
});
