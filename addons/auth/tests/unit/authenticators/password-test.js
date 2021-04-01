import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { Response } from 'miragejs';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Unit | Authenticator | password', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it authenticates to the specified authEndpoint', async function (assert) {
    assert.expect(2);
    const authenticator = this.owner.lookup('authenticator:password');
    this.server.post(
      authenticator.buildAuthEndpointURL(),
      (schema, request) => {
        const json = JSON.parse(request.requestBody);
        assert.ok(json.token_type, 'Requested token cookies by default');
        return new Response(200);
      }
    );
    await authenticator.authenticate({}).then(() => {
      assert.ok(true, 'authentication succeeded');
    });
  });

  test('it can authenticate without requesting cookies', async function (assert) {
    assert.expect(2);
    const authenticator = this.owner.lookup('authenticator:password');
    this.server.post(
      authenticator.buildAuthEndpointURL(),
      (schema, request) => {
        const json = JSON.parse(request.requestBody);
        assert.notOk(json.token_type, 'Did not request tokens cookies');
        return new Response(200);
      }
    );
    await authenticator.authenticate({}, false).then(() => {
      assert.ok(true, 'authentication succeeded');
    });
  });

  test('it authenticates with the expected payload', async function (assert) {
    assert.expect(1);
    const authenticator = this.owner.lookup('authenticator:password');
    this.server.post(
      authenticator.buildAuthEndpointURL(),
      (schema, request) => {
        const json = JSON.parse(request.requestBody);
        assert.deepEqual(json, {
          command: 'login',
          token_type: 'cookie',
          credentials: {
            login_name: 'foo',
            password: 'bar',
          },
        });
        return new Response(200);
      }
    );
    const creds = {
      identification: 'foo',
      password: 'bar',
    };
    await authenticator.authenticate(creds);
  });

  test('it rejects if the endpoint sends an error status code', async function (assert) {
    assert.expect(1);
    const authenticator = this.owner.lookup('authenticator:password');
    this.server.post(authenticator.buildAuthEndpointURL(), () => {
      return new Response(400);
    });
    await authenticator.authenticate({}).catch(() => {
      assert.ok(true, 'authentication failed');
    });
  });
});
