import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/link-button', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::LinkButton @route="index" />`);
    assert.ok(find('a'));
    assert.notOk(find('.rose-button'));
    assert.ok(find('.rose-link-button'));
  });

  test('it renders with attributes', async function (assert) {
    await render(hbs`<Rose::LinkButton @route="index" id="link-button"/>`);
    assert.ok(find('#link-button'));
  });

  test('it renders with content', async function (assert) {
    await render(
      hbs`<Rose::LinkButton @route="index">Link button content</Rose::LinkButton>`
    );
    assert.ok(
      find('.rose-link-button').textContent.trim(),
      'Link button content'
    );
  });

  test('it renders with rose button styles', async function (assert) {
    await render(hbs`<Rose::LinkButton @route="index" @style="sample"/>`);
    assert.ok(find(`.rose-button-sample`));
  });

  test('it supports left icon with @iconLeft', async function (assert) {
    await render(
      hbs`<Rose::LinkButton @route="index" @iconLeft="flight-icons/svg/chevron-left-16" />`
    );
    assert.ok(find('.rose-icon'));
    assert.ok(find('.has-icon-left'));
  });

  test('it supports left icon with @iconRight', async function (assert) {
    await render(
      hbs`<Rose::LinkButton @route="index" @iconRight="flight-icons/svg/entry-point-16" />`
    );
    assert.ok(find('.rose-icon'));
    assert.ok(find('.has-icon-right'));
  });

  test('it supports only icon with @iconOnly', async function (assert) {
    await render(
      hbs`<Rose::LinkButton @route="index" @iconOnly="flight-icons/svg/help-16" />`
    );
    assert.ok(find('.rose-icon'));
    assert.ok(find('.has-icon-only'));
  });
});
