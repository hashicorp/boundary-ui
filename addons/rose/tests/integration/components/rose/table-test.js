import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/table', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Table />`);
    assert.ok(find('table'));
    assert.ok(find('.rose-table'));
  });

  test('it renders with attributes', async function (assert) {
    await render(hbs`<Rose::Table id="table"/>`);
    assert.ok(find('#table'));
  });

  test('it renders with caption', async function (assert) {
    await render(hbs`<Rose::Table @caption="table caption"/>`);
    assert.ok(find('caption'));
    assert.equal(find('caption').textContent.trim(), 'table caption');
  });

  test('it renders with header', async function (assert) {
    await render(hbs`<Rose::Table as |table|>
      <table.header />
    </Rose::Table>`);
    assert.ok(find('thead'));
  });

  test('it renders with body', async function (assert) {
    await render(hbs`<Rose::Table as |table|>
      <table.body />
    </Rose::Table>`);
    assert.ok(find('tbody'));
  });

  test('it renders with footer', async function (assert) {
    await render(hbs`<Rose::Table as |table|>
      <table.footer />
    </Rose::Table>`);
    assert.ok(find('tfoot'));
  });

  test('it supports a style class', async function (assert) {
    await render(hbs`<Rose::Table @style="condensed" />`);
    assert.ok(find('.rose-table-condensed'));
  });
});
