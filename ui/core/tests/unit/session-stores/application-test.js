import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Session Store | application', function (hooks) {
  setupTest(hooks);

  let sessionStore;

  hooks.beforeEach(function () {
    sessionStore = this.owner.lookup('session-store:application');
    sessionStore.clear();
  });

  hooks.afterEach(function () {
    sessionStore.clear();
  });

  test('it exists', async function (assert) {
    assert.expect(1);
    assert.ok(sessionStore);
  });
});
