import { module, test } from 'qunit';
import { setupTest } from 'admin/tests/helpers';
import { waitUntil } from '@ember/test-helpers';

module(
  'Unit | Controller | scopes/scope/host-catalogs/index',
  function (hooks) {
    setupTest(hooks);

    let controller;

    hooks.beforeEach(function () {
      controller = this.owner.lookup(
        'controller:scopes/scope/host-catalogs/index',
      );
    });

    test('it exists', function (assert) {
      assert.ok(controller);
    });

    test('handleSearchInput action sets expected values correctly', async function (assert) {
      const searchValue = 'test';
      controller.handleSearchInput({ target: { value: searchValue } });
      await waitUntil(() => controller.search === searchValue);

      assert.strictEqual(controller.page, 1);
      assert.strictEqual(controller.search, searchValue);
    });
  },
);
