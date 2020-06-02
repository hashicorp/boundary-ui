import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/page-header/title', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::PageHeader::Title />`);
    assert.ok(find('.rose-page-header-title'));
  });

  test('it renders with title', async function (assert) {
    await render(hbs`<Rose::PageHeader::Title @text="header title" />`);
    assert.equal(
      find('.rose-page-header-title-text').textContent.trim(),
      'header title'
    );
  });

  test('it renders with title as dropdown', async function (assert) {
    await render(hbs`<Rose::PageHeader::Title as |title|>
      <title.dropdown @text="header title" as |dropdown|>
        <dropdown.link @route="index">Menu item</dropdown.link>
        <dropdown.link @route="index">Menu item</dropdown.link>
        <dropdown.button>Button menu item</dropdown.button>
        <dropdown.button>Button menu item</dropdown.button>
        <dropdown.button>Button menu item</dropdown.button>
      </title.dropdown>
    </Rose::PageHeader::Title>`);
    assert.equal(
      find('.rose-header-dropdown-trigger').textContent.trim(),
      'header title'
    );
    assert.equal(findAll('a').length, 2);
    assert.equal(findAll('button').length, 3);
  });

  test('it opens title dropdown on click', async function (assert) {
    await render(hbs`<Rose::PageHeader::Title id="title" as |title|>
      <title.dropdown id="dropdown" as |dropdown|>
        <dropdown.link @route="index">Menu item</dropdown.link>
        <dropdown.link @route="index">Menu item</dropdown.link>
        <dropdown.button>Button menu item</dropdown.button>
        <dropdown.button>Button menu item</dropdown.button>
        <dropdown.button>Button menu item</dropdown.button>
      </title.dropdown>
    </Rose::PageHeader::Title>`);
    await click('summary');
    assert.ok(find('#dropdown').open);
    await click('#title');
    assert.notOk(find('#dropdown').open);
  });
});
