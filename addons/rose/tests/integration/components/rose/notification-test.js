import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rose/notification', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`
      <Rose::Notification
        @style="info"
        @heading="Alert Notification"
      >
        An error occurred.
      </Rose::Notification>
    `);
    assert.ok(find('.rose-notification'));
    assert.equal(
      find('.rose-notification-body').textContent.trim(),
      'An error occurred.'
    );
  });

  test('it has optional dismiss button which triggers a function', async function (assert) {
    assert.expect(1);
    this.dismiss = () => assert.ok(true, 'dismiss clicked');
    await render(hbs`
      <Rose::Notification
        @style="info"
        @heading="Alert Notification"
        @dismiss={{this.dismiss}} />
    `);
    await click('.rose-notification-dismiss');
  });
});
