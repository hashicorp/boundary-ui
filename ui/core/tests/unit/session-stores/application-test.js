import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Session Store | application', function (hooks) {
  setupTest(hooks);

  let store;
  let applicationAdapter;
  let sessionStore;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    applicationAdapter = store.adapterFor('application');
    sessionStore = this.owner.lookup('session-store:application');
    sessionStore.clear();
  });

  hooks.afterEach(function () {
    sessionStore.clear();
  });

  test('it does not add an authorization header to application adapter on persist if no token is present', async function (assert) {
    assert.expect(1);
    sessionStore.persist({ authenticated: { token: null } });
    assert.notOk(applicationAdapter.headers.Authorization);
  });

  test('it adds an authorization header to application adapter on persist', async function (assert) {
    assert.expect(1);
    sessionStore.persist({ authenticated: { token: 'token1234' } });
    assert.equal(applicationAdapter.headers.Authorization, 'Bearer token1234');
  });

  test('it adds an authorization header to application adapter which already has headers on persist', async function (assert) {
    assert.expect(2);
    applicationAdapter.headers = { foo: 'bar' };
    sessionStore.persist({ authenticated: { token: 'token1234' } });
    assert.equal(applicationAdapter.headers.foo, 'bar');
    assert.equal(applicationAdapter.headers.Authorization, 'Bearer token1234');
  });
});
