import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/header/dropdown', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Header::Dropdown />`);
    assert.ok(find('.rose-header-dropdown'));
  });

  test('it renders with html attributes', async function (assert) {
    await render(
      hbs`<Rose::Header::Dropdown id="custom-id" class="custom-class"/>`
    );
    assert.ok(find('#custom-id'));
    assert.ok(find('.custom-class'));
  });

  test('it renders with trigger', async function (assert) {
    await render(hbs`<Rose::Header::Dropdown @text="Click me" />`);
    assert.equal(
      find('.rose-header-dropdown-trigger').textContent.trim(),
      'Click me'
    );
  });

  test('it renders with content', async function (assert) {
    await render(hbs`<Rose::Header::Dropdown @text="Click me" as |dropdown|>
      <dropdown.link @route="about"/>
      <dropdown.link @route="about"/>
      <dropdown.button />
      <dropdown.button />
      <dropdown.button />
    </Rose::Header::Dropdown>`);
    assert.ok(find('.rose-header-dropdown-content'));
    assert.equal(findAll('a').length, 2);
    assert.equal(findAll('button').length, 3);
  });

  test('it is toggled on click on trigger content', async function (assert) {
    await render(hbs`<Rose::Header::Dropdown id="dropdown" />`);

    assert.notOk(find('#dropdown').open);
    await click('summary');
    assert.ok(find('#dropdown').open);
    await click('summary');
    assert.notOk(find('#dropdown').open);
  });

  test('it is closed with outside click is triggered', async function (assert) {
    await render(hbs`
      <div id="wrapper">
        <Rose::Header::Dropdown id="dropdown" />
      </div>
    `);

    await click('summary');
    assert.ok(find('#dropdown').open);
    await click('#wrapper');
    assert.notOk(find('#dropdown').open);
  });
});
