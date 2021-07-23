import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Controller | scopes/scope/credential-stores/credential-store/credential-libraries',
  function (hooks) {
    setupTest(hooks);

    // TODO: Replace this with your real tests.
    test('it exists', function (assert) {
      let controller = this.owner.lookup(
        'controller:scopes/scope/credential-stores/credential-store/credential-libraries'
      );
      assert.ok(controller);
    });
  }
);
