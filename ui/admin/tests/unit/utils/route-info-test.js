import { paramValueFinder } from 'admin/utils/route-info';
import { module, test } from 'qunit';

module('Unit | Utility | route-info', function () {
  test('it works', function (assert) {
    let result = paramValueFinder('scope', null);
    assert.strictEqual(result.length, 0);
  });
});
