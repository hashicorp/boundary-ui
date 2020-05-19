import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/header/dropdown/trigger', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`<Rose::Header::Dropdown::Trigger />`);
    assert.ok(find('.rose-header-dropdown-trigger'));
    assert.notOk(find('.rose-header-dropdown-open'));
  });

  test('it renders with content', async function(assert) {
    await render(hbs`<Rose::Header::Dropdown::Trigger>
      trigger content
    </Rose::Header::Dropdown::Trigger>`);
    assert.equal(find('.rose-header-dropdown-trigger').textContent.trim(), 'trigger content');
  });

  test('it renders with html attributes', async function(assert) {
    await render(hbs`<Rose::Header::Dropdown::Trigger id="trigger" class="dropdown-trigger" />`);
    assert.equal(find('.rose-header-dropdown-trigger').id, 'trigger');
    assert.ok(find('.rose-header-dropdown-trigger').className.match('dropdown-trigger'));
  });

  test('it is open when @isOpen={{true}}', async function(assert) {
    await render(hbs`<Rose::Header::Dropdown::Trigger @isOpen={{true}} />`);
    assert.ok(find('.rose-header-dropdown-open'));
  });

  test('it renders chevron', async function(assert) {
    await render(hbs`<Rose::Header::Dropdown::Trigger />`);
    assert.ok(find('.rose-header-dropdown-chevron'));
  });
});
