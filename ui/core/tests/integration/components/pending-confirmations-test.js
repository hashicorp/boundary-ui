import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | pending-confirmations', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders pending confirmations', async function(assert) {
    assert.expect(2);
    const service = this.owner.lookup('service:confirm');
    service.enabled = true;
    await render(hbs`
      <PendingConfirmations as |confirmations|>
        <div class="pending">Pending</div>
      </PendingConfirmations>
    `);
    assert.equal(findAll('.pending').length, 0, 'No pending confirmations');
    service.confirm();
    await render(hbs`
      <PendingConfirmations as |confirmations|>
        <div class="pending">Pending</div>
      </PendingConfirmations>
    `);
    assert.equal(findAll('.pending').length, 1, 'One pending confirmations');
  });

  test('it exposes a confirm action that confirms the confirmation', async function(assert) {
    assert.expect(3);
    const service = this.owner.lookup('service:confirm');
    service.enabled = true;
    const confirmation = service.confirm();
    confirmation.then(() => assert.ok(true, 'confirmation.then was called'));
    await render(hbs`
      <PendingConfirmations as |confirmations confirm|>
        <button {{on "click" confirm}}>Confirm</button>
      </PendingConfirmations>
    `);
    assert.notOk(confirmation.done, 'Confirmation is not done');
    await click('button');
    assert.ok(confirmation.done, 'Confirmation is done');
  });

  test('it exposes a dismiss action that dismisses the confirmation', async function(assert) {
    assert.expect(3);
    const service = this.owner.lookup('service:confirm');
    service.enabled = true;
    const confirmation = service.confirm();
    confirmation.catch(() => assert.ok(true, 'confirmation.catch was called'));
    await render(hbs`
      <PendingConfirmations as |confirmations confirm dismiss|>
        <button {{on "click" dismiss}}>Dismiss</button>
      </PendingConfirmations>
    `);
    assert.notOk(confirmation.done, 'Confirmation is not done');
    await click('button');
    assert.ok(confirmation.done, 'Confirmation is done');
  });
});
