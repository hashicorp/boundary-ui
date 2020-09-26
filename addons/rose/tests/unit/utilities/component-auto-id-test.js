import { generateComponentID } from 'rose/utilities/component-auto-id';
import { module, test } from 'qunit';

module('Unit | Utility | component-auto-id', function () {
  test('it generates an ID', function (assert) {
    const id = generateComponentID();
    assert.ok(id);
  });
});
