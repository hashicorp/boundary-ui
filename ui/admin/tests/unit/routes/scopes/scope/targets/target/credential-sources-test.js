import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Route | scopes/scope/targets/target/credential-sources',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      let route = this.owner.lookup(
        'route:scopes/scope/targets/target/credential-sources'
      );
      assert.ok(route);
    });
  }
);
