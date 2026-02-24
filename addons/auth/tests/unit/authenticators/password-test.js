/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Pretender from 'pretender';

module('Unit | Authenticator | password', function (hooks) {
  setupTest(hooks);

  let server;

  hooks.beforeEach(() => {
    server = new Pretender();
  });

  hooks.afterEach(() => {
    server.shutdown();
  });

  test('it authenticates to the specified authEndpoint', async function (assert) {
    assert.expect(2);
    const authenticator = this.owner.lookup('authenticator:password');
    server.post(authenticator.buildAuthEndpointURL(), (request) => {
      const json = JSON.parse(request.requestBody);
      assert.ok(json.type, 'Requested token cookies by default');
      return [200, {}, '{}'];
    });
    await authenticator.authenticate({}).then(() => {
      assert.ok(true, 'authentication succeeded');
    });
  });

  test('it can authenticate without requesting cookies', async function (assert) {
    assert.expect(2);
    const authenticator = this.owner.lookup('authenticator:password');
    server.post(authenticator.buildAuthEndpointURL(), (request) => {
      const json = JSON.parse(request.requestBody);
      assert.notOk(json.type, 'Did not request tokens cookies');
      return [200, {}, '{}'];
    });
    await authenticator.authenticate({}, false).then(() => {
      assert.ok(true, 'authentication succeeded');
    });
  });

  test('it authenticates with the expected payload', async function (assert) {
    assert.expect(1);
    const authenticator = this.owner.lookup('authenticator:password');
    server.post(authenticator.buildAuthEndpointURL(), (request) => {
      const json = JSON.parse(request.requestBody);
      assert.deepEqual(json, {
        command: 'login',
        type: 'cookie',
        attributes: {
          login_name: 'foo',
          password: 'bar',
        },
      });
      return [200, {}, '{}'];
    });
    const creds = {
      identification: 'foo',
      password: 'bar',
    };
    await authenticator.authenticate(creds);
  });

  test('it rejects if the endpoint sends an error status code', async function (assert) {
    assert.expect(1);
    const authenticator = this.owner.lookup('authenticator:password');
    server.post(authenticator.buildAuthEndpointURL(), () => {
      return [400];
    });
    await authenticator.authenticate({}).catch(() => {
      assert.ok(true, 'authentication failed');
    });
  });
});
