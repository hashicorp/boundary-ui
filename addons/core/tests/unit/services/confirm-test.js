/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | confirm', function (hooks) {
  setupTest(hooks);

  test('`confirm()` emits promise-like instances', function (assert) {
    const service = this.owner.lookup('service:confirm');
    service.enabled = true;
    const confirmation = service.confirm();
    assert.ok(confirmation.then, 'confirmation has a then method');
    assert.ok(confirmation.catch, 'confirmation has a catch method');
    assert.ok(confirmation.finally, 'confirmation has a finally method');
  });

  test('`pending` is an array of pending confirmations', function (assert) {
    const service = this.owner.lookup('service:confirm');
    service.enabled = true;
    assert.strictEqual(
      service.pending.length,
      0,
      'No pending confirmations yet',
    );
    const confirmation = service.confirm();
    assert.strictEqual(
      service.pending.length,
      1,
      'One pending confirmation created',
    );
    confirmation.confirm();
    assert.strictEqual(service.pending.length, 0, 'Confirmation was confirmed');
  });

  test('confirmations may be confirmed or dismissed', function (assert) {
    const service = this.owner.lookup('service:confirm');
    service.enabled = true;
    let confirmation = service.confirm();
    assert.notOk(confirmation.done, 'Confirmation is pending');
    confirmation.confirm();
    assert.ok(confirmation.done, 'Confirmation is done via confirm');
    confirmation = service.confirm();
    assert.notOk(confirmation.done, 'Confirmation is pending');
    confirmation.dismiss();
    assert.ok(confirmation.done, 'Confirmation is done via dismiss');
  });

  test('confirmations resolve on confirm', function (assert) {
    assert.expect(1);
    const service = this.owner.lookup('service:confirm');
    service.enabled = true;
    const confirmation = service.confirm();
    confirmation.then(() => assert.ok(true, 'Confirmation confirmed'));
    confirmation.confirm();
  });

  test('confirmations reject on dismiss', function (assert) {
    assert.expect(1);
    const service = this.owner.lookup('service:confirm');
    service.enabled = true;
    const confirmation = service.confirm();
    confirmation.catch(() => assert.ok(true, 'Confirmation dismissed'));
    confirmation.dismiss();
  });

  test('confirmations have a finally method', function (assert) {
    assert.expect(2);
    const service = this.owner.lookup('service:confirm');
    service.enabled = true;
    let confirmation = service.confirm();
    confirmation.finally(() => assert.ok(true, 'Confirmation finally called'));
    confirmation.confirm();
    confirmation = service.confirm();
    confirmation.finally(() => assert.ok(true, 'Confirmation finally called'));
    confirmation.dismiss();
  });
});
