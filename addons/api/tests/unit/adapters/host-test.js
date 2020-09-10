import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | host', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let adapter = this.owner.lookup('adapter:host');
    assert.ok(adapter);
  });

});
