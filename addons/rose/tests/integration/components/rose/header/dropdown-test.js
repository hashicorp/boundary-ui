import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/header/dropdown', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`<Rose::Header::Dropdown />`);
    assert.ok(find('.rose-header-dropdown'));
  });

  test('it renders with html attributes', async function(assert) {
    await render(hbs`<Rose::Header::Dropdown id="custom-id" class="custom-class"/>`);
    assert.ok(find('#custom-id'));
    assert.ok(find('.custom-class'));
  });

  test('it renders with trigger', async function(assert) {
    await render(hbs`<Rose::Header::Dropdown as |dropdown|>
      <dropdown.trigger>Click me</dropdown.trigger>
    </Rose::Header::Dropdown>`);
    assert.ok(find('.rose-header-dropdown-trigger'));
    assert.equal(find('.rose-header-dropdown-trigger').textContent.trim(), 'Click me');
  });

  test('it renders with content', async function(assert) {
    await render(hbs`<Rose::Header::Dropdown as |dropdown|>
      <dropdown.content as |content|>
        <content.link @route="about"/>
        <content.link @route="about"/>
        <content.button />
        <content.button />
        <content.button />
      </dropdown.content>
    </Rose::Header::Dropdown>`);
    assert.ok(find('.rose-header-dropdown-content'));
    assert.equal(findAll('a').length, 2);
    assert.equal(findAll('button').length, 3);
  });

  test('it is opened when @isOpen={{true}}', async function(assert) {
    this.set('isOpen', false);
    await render(hbs`<Rose::Header::Dropdown @isOpen={{this.isOpen}} as |dropdown|>
      <dropdown.trigger>Click me</dropdown.trigger>
      <dropdown.content as |content|>
        <content.button />
      </dropdown.content>
    </Rose::Header::Dropdown>`);
    assert.notOk(find('.rose-header-dropdown-trigger.rose-header-dropdown-open'));
    assert.notOk(find('.rose-header-dropdown-content.rose-header-dropdown-open'));

    this.set('isOpen', true);
    assert.ok(find('.rose-header-dropdown-trigger.rose-header-dropdown-open'));
    assert.ok(find('.rose-header-dropdown-content.rose-header-dropdown-open'));
  });

  test('it is toggled on click on trigger content', async function(assert) {
    await render(hbs`<Rose::Header::Dropdown id="dropdown" as |dropdown|>
      <dropdown.trigger id="trigger">Click me</dropdown.trigger>
      <dropdown.content as |content|>
        <content.button />
      </dropdown.content>
    </Rose::Header::Dropdown>`);
    assert.notOk(find('#dropdown').open);
    assert.notOk(find('.rose-header-dropdown-trigger.rose-header-dropdown-open'));
    assert.notOk(find('.rose-header-dropdown-content.rose-header-dropdown-open'));

    await click('#trigger');

    assert.ok(find('#dropdown').open);
    assert.ok(find('.rose-header-dropdown-trigger.rose-header-dropdown-open'));
    assert.ok(find('.rose-header-dropdown-content.rose-header-dropdown-open'));

    await click('#trigger');
    assert.notOk(find('#dropdown').open);
    assert.notOk(find('.rose-header-dropdown-trigger.rose-header-dropdown-open'));
    assert.notOk(find('.rose-header-dropdown-content.rose-header-dropdown-open'));
  });

  test('it is closed with outside click is triggered', async function(assert) {
    await render(hbs`<div id="wrapper"><Rose::Header::Dropdown id="dropdown" as |dropdown|>
      <dropdown.trigger id="trigger">Click me</dropdown.trigger>
      <dropdown.content as |content|>
        <content.button />
      </dropdown.content>
    </Rose::Header::Dropdown></div>`);

    await click('#trigger');
    assert.ok(find('#dropdown').open);

    await click('#wrapper');
    assert.notOk(find('#dropdown').open);
  });
});
