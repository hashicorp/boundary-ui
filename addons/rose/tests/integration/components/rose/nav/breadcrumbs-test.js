import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/nav/breadcrumbs', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Nav::Breadcrumbs />`);
    assert.ok(find('.rose-nav-breadcrumbs'));
  });

  test('it renders with attributes', async function (assert) {
    await render(hbs`<Rose::Nav::Breadcrumbs id="breadcrumbs"/>`);
    assert.ok(find('#breadcrumbs'));
  });

  test('it renders with breadcrumb links', async function (assert) {
    await render(hbs`<Rose::Nav::Breadcrumbs as |breadcrumbs|>
      <breadcrumbs.link @route="index" />
      <breadcrumbs.link @route="index" />
    </Rose::Nav::Breadcrumbs>`);
    assert.equal(findAll('.rose-nav-breadcrumbs-link').length, 2);
  });
});
