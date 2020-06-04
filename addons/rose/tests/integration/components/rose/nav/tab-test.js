import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/nav/tab', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Nav::Tab />`);
    assert.ok(find('a'));
    assert.ok(find('.rose-nav-tab'));
    assert.ok(find('.rose-nav-tab-link'));
    assert.notOk(find('.rose-nav-tab-icon'));
    assert.notOk(find('.rose-nav-tab-badge'));
    assert.notOk(find('.rose-nav-tab-link-disabled'));
  });

  test('it renders with title', async function (assert) {
    await render(hbs`<Rose::Nav::Tab @title="Tab title" />`);
    assert.equal(find('a').title, 'Tab title');
    assert.equal(find('.rose-nav-tab-link').textContent.trim(), 'Tab title');
  });

  test('it renders with icon', async function (assert) {
    await render(hbs`<Rose::Nav::Tab @icon="info-circle-outline" />`);
    assert.ok(find('svg'));
    assert.ok(find('.rose-nav-tab-icon'));
  });

  test('it renders with badge', async function (assert) {
    await render(hbs`<Rose::Nav::Tab @badge="3" />`);
    assert.ok(find('.rose-nav-tab-badge'));
    assert.equal(find('.rose-nav-tab-badge').textContent.trim(), '3');
  });

  test('it render with attributes', async function (assert) {
    await render(hbs`<Rose::Nav::Tab id="tab" />`);
    assert.ok(find('#tab'));
  });

  test('it renders disabled', async function (assert) {
    this.set('disabled', true);
    await render(hbs`<Rose::Nav::Tab @disabled={{this.disabled}} />`);
    assert.ok(find('.rose-nav-tab-link-disabled'));

    this.set('disabled', false);
    assert.notOk(find('.rose-nav-tab-link-disabled'));
  });
});
