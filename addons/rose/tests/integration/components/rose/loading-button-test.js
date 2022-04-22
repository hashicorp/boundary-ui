import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/loading-button', function (hooks) {
  setupRenderingTest(hooks);
  test('it renders', async function (assert) {
    this.onClick = () => {};
    await render(hbs`<Rose::LoadingButton @onClick={{fn this.onClick}}/>`);
    assert.ok(find('.refresh-button'));
  });

  test('it executes a function on refresh button click', async function (assert) {
    assert.expect(1);
    this.onClick = () => assert.ok(true, 'refresh was clicked');
    await render(hbs`{{rose/loading-button onClick=this.onClick}}`);
    await click('button');
  });
});
