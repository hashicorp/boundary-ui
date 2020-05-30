import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/nav/primary', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(2)
    await render(hbs`
      <Rose::Nav::Primary @title="Title" as |nav|>
        <nav.link @route="index">Item Name</nav.link>
      </Rose::Nav::Primary>
    `);
    assert.equal(find('.rose-nav-title').textContent.trim(), 'Title');
    assert.equal(find('.rose-nav-link').textContent.trim(), 'Item Name');
  });

  test('it associates title with nav via aria-labelledby', async function (assert) {
    assert.expect(2)
    await render(hbs`
      <Rose::Nav::Primary @title="Title" as |nav|>
        <nav.link @route="index">Item Name</nav.link>
      </Rose::Nav::Primary>
    `);
    const el = find('.rose-nav-primary');
    const id = el.id;
    const titleId = `title-${id}`;
    const titleEl = find('.rose-nav-title');
    assert.equal(titleEl.id, titleId);
    assert.equal(el.getAttribute('aria-labelledby').trim(), titleId);
  });
});
