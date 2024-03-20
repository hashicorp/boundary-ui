import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Controller | scopes/scope/credential-stores/credential-store/credentials/index',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      let controller = this.owner.lookup(
        'controller:scopes/scope/credential-stores/credential-store/credentials/index',
      );
      assert.ok(controller);
    });
  },
);
