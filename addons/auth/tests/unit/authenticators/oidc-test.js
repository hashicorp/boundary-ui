/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Pretender from 'pretender';

module('Unit | Authenticator | OIDC', function (hooks) {
  setupTest(hooks);

  let server;

  hooks.beforeEach(() => {
    server = new Pretender();
  });

  hooks.afterEach(() => {
    server.shutdown();
  });

  test('`startAuthentication` initiates the authentication flow and returns the response', async function (assert) {
    const authenticator = this.owner.lookup('authenticator:oidc');
    server.post(authenticator.buildAuthEndpointURL(), () => [
      200,
      {},
      JSON.stringify({ foo: 'bar' }),
    ]);
    const response = await authenticator.startAuthentication();
    assert.ok(true, 'authentication succeeded');
    assert.deepEqual(response, { foo: 'bar' });
  });

  test('`startAuthentication` rejects/errors if API returns an error response', async function (assert) {
    assert.expect(1);
    const authenticator = this.owner.lookup('authenticator:oidc');
    server.post(authenticator.buildAuthEndpointURL(), () => [400]);
    // Because assert.throws doesn't work with async errors/promise rejections
    try {
      await authenticator.startAuthentication();
    } catch (e) {
      assert.ok(true);
    }
  });
});
