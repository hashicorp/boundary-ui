import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/layout/centered', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Layout::Centered />`);
    assert.ok(find('.rose-layout-centered'));
    assert.notOk(find('.rose-layout-centered-body'));
  });

  test('it renders with attributes', async function (assert) {
    await render(hbs`<Rose::Layout::Centered id="layout"/>`);
    assert.ok(find('#layout'));
  });

  test('it renders with content', async function (assert) {
    await render(hbs`<Rose::Layout::Centered as |layout|>
      <layout.body>Layout content</layout.body>
    </Rose::Layout::Centered>`);
    assert.equal(
      find('.rose-layout-centered').textContent.trim(),
      'Layout content'
    );
  });
});
