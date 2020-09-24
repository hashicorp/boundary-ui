import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/form/actions', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders a submit button and a regular button', async function (assert) {
    assert.expect(2);
    this.cancel = () => {};
    await render(hbs`{{rose/form/actions cancel=this.cancel}}`);
    assert.ok(find('[type="submit"]'));
    assert.ok(find('button:not([type="submit"])'));
  });

  test('it can disable the buttons', async function (assert) {
    assert.expect(2);
    this.cancel = () => {};
    await render(hbs`{{rose/form/actions cancel=this.cancel submitDisabled=true cancelDisabled=true}}`);
    assert.ok(find('[type="submit"]:disabled'));
    assert.ok(find('button:not([type="submit"]):disabled'));
  });

  test('it optionally does not render the cancel button', async function (assert) {
    assert.expect(2);
    await render(hbs`{{rose/form/actions showCancel=false}}`);
    assert.ok(find('[type="submit"]'));
    assert.notOk(find('button:not([type="submit"])'));
  });

  test('it executes a function on cancel click', async function (assert) {
    assert.expect(1);
    this.cancel = () => assert.ok(true, 'cancel was clicked');
    await render(hbs`{{rose/form/actions cancel=this.cancel}}`);
    await click('button:not([type="submit"])');
  });
});
