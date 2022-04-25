import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/loading-button', function (hooks) {
  setupRenderingTest(hooks);
  test('it renders', async function (assert) {
    await render(hbs`<Rose::LoadingButton/>`);
    assert.ok(find('.refresh-button'));
  });

  test('it executes a function on refresh button click', async function (assert) {
    assert.expect(2);
    this.onClick = () => assert.ok(true, 'refresh was clicked');
    await render(hbs`<Rose::LoadingButton @onClick={{this.onClick}}/>`);
    assert.ok(find('.refresh-button'));
    await click('button');
  });
});
