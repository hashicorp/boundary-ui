import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/dialog', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders and handles dismiss actions', async function (assert) {
    assert.expect(5);
    this.dismiss = () => assert.ok(true, 'dismissed');
    await render(hbs`
      <Rose::Dialog
        @dismiss={{this.dismiss}}
        @heading="Heading"
      as |dialog|>
        <dialog.body>Dialog</dialog.body>
        <dialog.footer>Dialog</dialog.footer>
      </Rose::Dialog>
    `);
    assert.ok(find('.rose-dialog'));
    assert.ok(find('.rose-dialog-header'));
    assert.ok(find('.rose-dialog-body'));
    assert.ok(find('.rose-dialog-footer'));
    await click('button');
  });

});
