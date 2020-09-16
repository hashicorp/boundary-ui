import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/dropdown/link', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Dropdown::Link />`);
    assert.ok(find('a'));
    assert.ok(find('.rose-dropdown-link'));
  });

  test('it renders with attributes', async function (assert) {
    await render(hbs`<Rose::Dropdown::Link id="dropdown" />`);
    assert.ok(find('#dropdown'));
  });

  test('it renders with content', async function (assert) {
    await render(hbs`<Rose::Dropdown::Link>
      content
    </Rose::Dropdown::Link>`);
    assert.equal(find('.rose-dropdown-link').textContent.trim(), 'content');
  });

  test('it supports style', async function (assert) {
    await render(hbs`<Rose::Dropdown::Link @style='warning' />`);
    assert.ok('.rose-dropdown-link-warning');
  });
});
