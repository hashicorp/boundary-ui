import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/link-button/body', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::LinkButton::Body />`);
    assert.ok(find('.rose-button-wrapper'));
  });

  test('it renders with content', async function (assert) {
    await render(hbs`<Rose::LinkButton::Body>
      Body content
    </Rose::LinkButton::Body>`);
    assert.equal(
      find('.rose-button-wrapper').textContent.trim(),
      'Body content'
    );
  });

  test('it supports @iconLeft', async function (assert) {
    await render(hbs`<Rose::LinkButton::Body @iconLeft="chevron-left"/>`);
    assert.ok(find('.rose-icon'));
  });

  test('it supports @iconRight', async function (assert) {
    await render(hbs`<Rose::LinkButton::Body @iconRight="chevron-right" />`);
    assert.ok(find('.rose-icon'));
  });

  test('it supports @iconOnly', async function (assert) {
    await render(
      hbs`<Rose::LinkButton::Body @iconOnly="help-circle-outline" />`
    );
    assert.ok(find('.rose-icon'));
  });
});
