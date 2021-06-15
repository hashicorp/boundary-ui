import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | dialog-detail', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<DialogDetail />`);
    assert.ok(find('.dialog-detail'));
  });

  test('it renders with content', async function (assert) {
    await render(hbs`
      <DialogDetail>
        <dialogDetail.notification />
        <dialogDetail.body>
          <h2>Test</h2>
        </dialogDetail.body>
        <dialogDetail.footer></dialogDetail.footer>
      </DialogDetail>
    `);

    assert.ok(find('.dialog-detail'));
    assert.ok(find('.rose-dialog-header'));
    assert.ok(find('.rose-dialog-body'));
    assert.ok(find('.rose-dialog-footer'));
  });
});
