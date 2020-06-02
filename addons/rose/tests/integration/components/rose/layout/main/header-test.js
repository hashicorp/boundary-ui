import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/layout/main/header', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Layout::Main::Header />`);
    assert.ok(find('.rose-layout-main-header'));
  });

  test('it renders with title', async function (assert) {
    await render(hbs`<Rose::Layout::Main::Header as |header|>
      <header.title @text="header title" />
    </Rose::Layout::Main::Header>`);
    assert.ok(find('.rose-layout-main-header-title'));
    assert.equal(
      find('.rose-layout-main-header-title').textContent.trim(),
      'header title'
    );
  });

  test('it renders with dropdown title', async function (assert) {
    await render(hbs`<Rose::Layout::Main::Header as |header|>
      <header.title as |title|>
        <title.dropdown @text="Dropdown title" />
      </header.title>
    </Rose::Layout::Main::Header>`);
    assert.ok(find('.rose-header-dropdown'));
    assert.equal(
      find('.rose-layout-main-header-title').textContent.trim(),
      'Dropdown title'
    );
  });

  test('it renders with dropdown title menu', async function (assert) {
    await render(hbs`<Rose::Layout::Main::Header as |header|>
      <header.title as |title|>
        <title.dropdown as |dropdown|>
          <dropdown.link @route="index">Menu item</dropdown.link>
          <dropdown.button>Button menu item</dropdown.button>
        </title.dropdown>
      </header.title>
    </Rose::Layout::Main::Header>`);
    assert.ok(find('.rose-header-dropdown'));
    assert.equal(findAll('a').length, 1);
    assert.equal(findAll('button').length, 1);
  });

  test('it renders with actions', async function (assert) {
    await render(hbs`<Rose::Layout::Main::Header as |header|>
      <header.action />
      <header.action />
    </Rose::Layout::Main::Header>`);
    assert.ok(find('.rose-layout-main-header-actions'));
    assert.ok(findAll('button').length, 2);
  });
});
