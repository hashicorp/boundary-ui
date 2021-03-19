import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { Response } from 'miragejs';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Unit | Authenticator | OIDC', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('`startAuthentication` initiates the authentication flow and returns the response', async function (assert) {
    assert.expect(2);
    const authenticator = this.owner.lookup('authenticator:oidc');
    this.server.post(
      authenticator.buildStartAuthEndpointURL(),
      () => new Response(200, {}, { foo: 'bar' })
    );
    const response = await authenticator.startAuthentication();
    assert.ok(true, 'authentication succeeded');
    assert.deepEqual(response, { foo: 'bar' });
  });

  test('`startAuthentication` rejects/errors if API returns an error response', async function (assert) {
    assert.expect(1);
    const authenticator = this.owner.lookup('authenticator:oidc');
    this.server.post(
      authenticator.buildStartAuthEndpointURL(),
      () => new Response(400)
    );
    // Because assert.throws doesn't work with async errors/promise rejections
    try {
      await authenticator.startAuthentication();
    } catch (e) {
      assert.ok(true);
    }
  });
});
