import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/icon', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Rose::Icon @name="unfold-more" />`);
    assert.ok(find('svg'));
  });

  test('it supports optional @size', async function (assert) {
    await render(hbs`<Rose::Icon @name="unfold-more" @size="small" />`);
    assert.ok(find('.small'));
  });
});
