/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Session Store | cookie', function (hooks) {
  setupTest(hooks);

  let sessionStore;

  hooks.beforeEach(function () {
    sessionStore = this.owner.lookup('session-store:cookie');
    sessionStore.clear();
  });

  hooks.afterEach(function () {
    sessionStore.clear();
  });

  test('it restores a session if both necessary cookies are present (session exists)', async function (assert) {
    sessionStore.cookies.write(sessionStore.cookieName, 'token-value', {
      path: '/',
    });
    sessionStore.cookies.write(
      sessionStore.authenticatorCookieName,
      'authenticator-name',
      { path: '/' },
    );
    assert.ok(sessionStore.sessionExists);
    const session = await sessionStore.restore();
    assert.deepEqual(session, {
      authenticated: {
        authenticator: 'authenticator-name',
      },
    });
  });

  test('it rejects restore if the session does not exist', async function (assert) {
    assert.notOk(sessionStore.sessionExists);
    await sessionStore.restore().catch(() => {});
    assert.ok(true, 'Rejected');
  });

  test('it cleans up cookies on restore rejection', async function (assert) {
    // For session cookie
    sessionStore.cookies.write(sessionStore.cookieName, 'token-value', {
      path: '/',
    });
    assert.ok(
      sessionStore.cookies.exists(sessionStore.cookieName),
      'cookie exists',
    );
    await sessionStore.restore().catch(() => {});
    assert.notOk(
      sessionStore.cookies.exists(sessionStore.cookieName),
      'cookie was cleared',
    );
    // For authenticator name cookie
    sessionStore.cookies.write(
      sessionStore.authenticatorCookieName,
      'authenticator-name',
      { path: '/' },
    );
    assert.ok(
      sessionStore.cookies.exists(sessionStore.authenticatorCookieName),
      'cookie exists',
    );
    await sessionStore.restore().catch(() => {});
    assert.notOk(
      sessionStore.cookies.exists(sessionStore.authenticatorCookieName),
      'cookie was cleared',
    );
  });

  test('it persists only an authenticator name cookie, since the server persists the session cookie', async function (assert) {
    assert.notOk(sessionStore.cookies.exists(sessionStore.cookieName));
    assert.notOk(
      sessionStore.cookies.exists(sessionStore.authenticatorCookieName),
    );
    sessionStore.persist({ authenticated: { authenticator: 'foobar' } });
    assert.notOk(
      sessionStore.cookies.exists(sessionStore.cookieName),
      'session cookie was not set',
    );
    assert.strictEqual(
      sessionStore.cookies.read(sessionStore.authenticatorCookieName),
      'foobar',
    );
  });
});
