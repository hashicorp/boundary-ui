import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/header/dropdown/content', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`<Rose::Header::Dropdown::Content />`);
    assert.ok(find('.rose-header-dropdown-content'));
  });

  test('it renders with content', async function(assert) {
    await render(hbs`<Rose::Header::Dropdown::Content>
      content
    </Rose::Header::Dropdown::Content>`);
    assert.equal(find('.rose-header-dropdown-content').textContent.trim(), 'content');
  });

  test('it renders with html attributes', async function(assert) {
    await render(hbs`<Rose::Header::Dropdown::Content id="dropdown-content" class="universe" />`);
    assert.equal(find('.rose-header-dropdown-content').id, 'dropdown-content');
    assert.ok(find('.rose-header-dropdown-content').className.match('universe'));
  });

  test('it is open when @isOpen={{true}}', async function(assert) {
    this.set('isOpen', false);
    await render(hbs`<Rose::Header::Dropdown::Content @isOpen={{this.isOpen}} />`);
    assert.notOk(find('.rose-header-dropdown-open'));

    this.set('isOpen', true);
    assert.ok(find('.rose-header-dropdown-open'));
  });

  test('it is positioned right when @position={{true}}', async function(assert) {
    await render(hbs`<Rose::Header::Dropdown::Content />`);
    assert.notOk(find('.rose-header-dropdown-content-right'));

    await render(hbs`<Rose::Header::Dropdown::Content @position="{{true}}"/>`);
    assert.ok(find('.rose-header-dropdown-content-right'));
  });

  test('it render link element', async function(assert) {
    await render(hbs`<Rose::Header::Dropdown::Content as |content|>
      <content.link @route="about" />
    </Rose::Header::Dropdown::Content>`);
    assert.ok(find('a'));
    assert.ok(find('.rose-header-dropdown-content-link'));
  });

  test('it render link element with content', async function(assert) {
    await render(hbs`<Rose::Header::Dropdown::Content as |content|>
      <content.link @route="about">linkify</content.link>
    </Rose::Header::Dropdown::Content>`);
    assert.equal(find('a').textContent.trim(), 'linkify');
  });

  test('it render button element', async function(assert) {
    await render(hbs`<Rose::Header::Dropdown::Content as |content|>
      <content.button />
    </Rose::Header::Dropdown::Content>`);
    assert.ok(find('button'));
    assert.ok(find('.rose-header-dropdown-content-button'));
  });

  test('it render button element with content', async function(assert) {
    await render(hbs`<Rose::Header::Dropdown::Content as |content|>
      <content.button>dropdown button</content.button>
    </Rose::Header::Dropdown::Content>`);
    assert.equal(find('button').textContent.trim(), 'dropdown button');
  });
});
