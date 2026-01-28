/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Pretender from 'pretender';

module('Unit | Authenticator | base', function (hooks) {
  setupTest(hooks);

  let server;

  hooks.beforeEach(() => {
    server = new Pretender();
  });

  hooks.afterEach(() => {
    server.shutdown();
  });

  test('it deauthenticates on invalidation', async function (assert) {
    assert.expect(1);
    const authenticator = this.owner.lookup('authenticator:base');
    const endpoint = authenticator.buildDeauthEndpointURL({ id: 'token123' });
    server.delete(endpoint, () => {
      assert.ok(true, 'deauthentication occurred');
      return [200];
    });
    await authenticator.invalidate({ token: 'token123' });
  });

  test('invalidation succeeds even if the deauthentication request fails', async function (assert) {
    assert.expect(2);
    const authenticator = this.owner.lookup('authenticator:base');
    const endpoint = authenticator.buildDeauthEndpointURL({ id: 'token123' });
    server.delete(endpoint, () => {
      assert.ok(true, 'deauthentication was requested');
      return [500];
    });
    await authenticator
      .invalidate({ token: 'token123' })
      .then(() => assert.ok(true))
      .catch(() => assert.notOk(true, 'uh oh, this should not happen'));
  });

  test('it passes token validation on restoration if receiving 200', async function (assert) {
    assert.expect(1);
    const id = 'token_123';
    const mockData = { attributes: { id } };
    const authenticator = this.owner.lookup('authenticator:base');
    server.get(authenticator.buildTokenValidationEndpointURL(id), () => {
      assert.ok(true, 'token validation was requested');
      return [200, {}, '{}'];
    });
    await authenticator.restore(mockData);
  });

  test('it fails token validation on restoration if receiving 401', async function (assert) {
    assert.expect(2);
    const id = 'token_123';
    const mockData = { attributes: { id } };
    const authenticator = this.owner.lookup('authenticator:base');
    server.get(authenticator.buildTokenValidationEndpointURL(id), () => {
      assert.ok(true, 'token validation was requested');
      return [401, {}, '{}'];
    });
    try {
      await authenticator.restore(mockData);
    } catch (e) {
      assert.ok(true, 'restoration failed');
    }
  });

  test('it fails token validation on restoration if receiving 404', async function (assert) {
    assert.expect(2);
    const id = 'token_123';
    const mockData = { attributes: { id } };
    const authenticator = this.owner.lookup('authenticator:base');
    server.get(authenticator.buildTokenValidationEndpointURL(id), () => {
      assert.ok(true, 'token validation was requested');
      return [404, {}, '{}'];
    });
    try {
      await authenticator.restore(mockData);
    } catch (e) {
      assert.ok(true, 'restoration failed');
    }
  });
});
