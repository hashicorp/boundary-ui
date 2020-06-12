import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { Response } from 'miragejs';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Unit | Authenticator | userpass', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it authenticates to the specified authEndpoint', async function (assert) {
    assert.expect(1);
    const authenticator = this.owner.lookup('authenticator:userpass');
    this.server.post(authenticator.authEndpoint, () => {
      return new Response(200);
    });
    await authenticator.authenticate('username', 'password').then(() => {
      assert.ok(true, 'authentication succeeded');
    });
  });

  test('it rejects if the endpoint sends an error status code', async function (assert) {
    assert.expect(1);
    const authenticator = this.owner.lookup('authenticator:userpass');
    this.server.post(authenticator.authEndpoint, () => {
      return new Response(400);
    });
    await authenticator.authenticate('username', 'password').catch(() => {
      assert.ok(true, 'authentication failed');
    });
  });
});
