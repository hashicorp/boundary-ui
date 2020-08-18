import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Unit | Authenticator | password', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  let store;
  let applicationAdapter;
  let session;
  let authenticator;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    applicationAdapter = store.adapterFor('application');
    session = this.owner.lookup('service:session');
    authenticator = this.owner.lookup('authenticator:password');
    session.invalidate();
  });

  hooks.afterEach(function () {
    session.invalidate();
  });

  test('it does not add an authorization header to application adapter on restore if no token is present', async function (assert) {
    assert.expect(1);
    authenticator.restore({ token: null });
    assert.notOk(applicationAdapter?.headers?.Authorization);
  });

  test('it adds an authorization header to application adapter on restore', async function (assert) {
    assert.expect(1);
    authenticator.restore({ token: 'token1234' });
    assert.equal(applicationAdapter.headers.Authorization, 'Bearer token1234');
  });

  test('it adds an authorization header to application adapter on authenticate', async function (assert) {
    assert.expect(1);
    const creds = { identification: 'foo', password: 'bar' };
    const scope = { id: 'global' };
    const authMethod = { id: 'paum_1234' };
    await authenticator.authenticate(
      creds,
      null,
      { scope, authMethod }
    );
    assert.equal(applicationAdapter.headers.Authorization, 'Bearer thetokenstring');
  });
});
