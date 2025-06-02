import { sortNameWithIdFallback } from 'admin/utils/sort-name-with-id-fallback';
import { module, test } from 'qunit';

function createMockRecord(id, attributes = {}) {
  return {
    id,
    attributes,
  };
}

module('Unit | Utility | sort-name-with-id-fallback', function () {
  test.each(
    'sort on name with id fallback',
    [
      {
        recordA: createMockRecord('id_01'),
        recordB: createMockRecord('id_01'),
        expectedResult: 0,
      },
      {
        recordA: createMockRecord('id_02'),
        recordB: createMockRecord('id_01'),
        expectedResult: 1,
      },
      {
        recordA: createMockRecord('id_01'),
        recordB: createMockRecord('id_02'),
        expectedResult: -1,
      },
      {
        recordA: createMockRecord('id_01', { name: 'Alpha' }),
        recordB: createMockRecord('id_02'),
        expectedResult: -1,
      },
      {
        recordA: createMockRecord('id_01'),
        recordB: createMockRecord('id_02', { name: 'Alpha' }),
        expectedResult: 1,
      },
      {
        recordA: createMockRecord('id_01', { name: 'Alpha' }),
        recordB: createMockRecord('id_02', { name: 'Beta' }),
        expectedResult: -1,
      },
      {
        recordA: createMockRecord('id_01', { name: 'Beta' }),
        recordB: createMockRecord('id_02', { name: 'Alpha' }),
        expectedResult: 1,
      },
      {
        recordA: createMockRecord('id_01', { name: 'Alpha' }),
        recordB: createMockRecord('id_02', { name: 'Alpha' }),
        expectedResult: 0,
      },
    ],
    function (assert, input) {
      const result = sortNameWithIdFallback(input.recordA, input.recordB);

      assert.strictEqual(result, input.expectedResult);
    },
  );
});
