import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { AuthMethod, AuthMethodOIDC } from 'api/classes/auth-method';

module('Unit | Class | auth method', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it exists', function (assert) {
    assert.ok(AuthMethod);
    assert.ok(AuthMethodOIDC);
  });

  test('oidc auth method lists states', function (assert) {
    assert.deepEqual(AuthMethodOIDC.states, [
      'inactive',
      'active-private',
      'active-public',
    ]);
  });
});
