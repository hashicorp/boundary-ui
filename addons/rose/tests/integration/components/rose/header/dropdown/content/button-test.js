import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/header/dropdown/content/button', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`<Rose::Header::Dropdown::Content::Button />`);
    assert.ok(find('.rose-header-dropdown-content-button'));
  });

  test('it renders with content', async function(assert) {
    await render(hbs`<Rose::Header::Dropdown::Content::Button>Button content</Rose::Header::Dropdown::Content::Button>`);
    assert.equal(find('.rose-header-dropdown-content-button').textContent.trim(), 'Button content');
  });

  test('it render button element', async function(assert) {
    await render(hbs`<Rose::Header::Dropdown::Content::Button />`);
    assert.ok(find('button'));
    assert.equal(find('button').type, 'button');
  });
});
