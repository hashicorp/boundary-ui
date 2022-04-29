import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | loading-button', function (hooks) {
  setupRenderingTest(hooks);
  test('it renders', async function (assert) {
    await render(hbs`<LoadingButton />`);
    assert.ok(find('.loading-button'));
  });

  test('it executes a function on refresh button click', async function (assert) {
    assert.expect(2);
    this.onClick = () => assert.ok(true, 'refresh was clicked');
    await render(hbs`<LoadingButton @onClick={{this.onClick}}/>`);
    assert.ok(find('.loading-button'));
    await click('button');
  });
});
