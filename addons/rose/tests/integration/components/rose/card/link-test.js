import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/card/link', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Card::Link />`);
    assert.ok(find('article'));
    assert.ok(find('.rose-card-link'));
    assert.ok(find('.rose-card-link-header'));
    assert.ok(find('.rose-card-link-body'));
    assert.ok(find('.rose-card-link-footer'));
  });

  test('it renders with @title', async function (assert) {
    await render(hbs`<Rose::Card::Link @title="card title" />`);
    assert.equal(find('a').title, 'card title');
    assert.equal(
      find('.rose-card-link-title').textContent.trim(),
      'card title'
    );
  });

  test('it renders with @description', async function (assert) {
    await render(hbs`<Rose::Card::Link @description="card description" />`);
    assert.equal(
      find('.rose-card-link-body').textContent.trim(),
      'card description'
    );
  });

  test('it renders with @id', async function (assert) {
    await render(hbs`<Rose::Card::Link @id="card_id" />`);
    assert.equal(
      find('.rose-card-link-footer-id').textContent.trim(),
      'card_id'
    );
  });

  test('it renders with @icon', async function (assert) {
    await render(hbs`<Rose::Card::Link @title="foo" @icon="alert-circle-outline" />`);
    assert.ok(find('.rose-icon'));
  });

  test('it renders with attributes', async function (assert) {
    await render(hbs`<Rose::Card::Link id="card" />`);
    assert.ok(find('#card'));
  });

  test('it renders with content', async function (assert) {
    await render(hbs`<Rose::Card::Link>
      <button/>
    </Rose::Card::Link>`);
    assert.ok(find('button'));
  });
});
