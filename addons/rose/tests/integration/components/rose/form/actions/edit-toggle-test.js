import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/form/actions/edit-toggle', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders a regular button', async function (assert) {
    assert.expect(1);
    this.enableEdit = () => {};
    await render(hbs`{{rose/form/actions/edit-toggle enableEdit=this.enableEdit}}`);
    assert.ok(find('button'));
  });

  test('it executes a function on button click', async function (assert) {
    assert.expect(1);
    this.enableEdit = () => assert.ok(true, 'edit was clicked');
    await render(hbs`{{rose/form/actions/edit-toggle enableEdit=this.enableEdit}}`);
    await click('button');
  });
});
