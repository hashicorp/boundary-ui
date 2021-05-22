import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Model | fragment auth method attributes account claim map',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      let store = this.owner.lookup('service:store');
      let model = store.createRecord(
        'fragment-auth-method-attributes-account-claim-map',
        {}
      );
      assert.ok(model);
    });
  }
);
