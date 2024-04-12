import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { waitUntil } from '@ember/test-helpers';
import { TYPE_TARGET_TCP, TYPE_TARGET_SSH } from 'api/models/target';

module('Unit | Controller | scopes/scope/targets/index', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let controller = this.owner.lookup('controller:scopes/scope/targets/index');
    assert.ok(controller);
  });

  test('availableSessionOptions returns expected object', function (assert) {
    let controller = this.owner.lookup('controller:scopes/scope/targets/index');
    assert.deepEqual(controller.availableSessionOptions, [
      { id: 'yes', name: 'Has active sessions' },
      { id: 'no', name: 'No active sessions' },
    ]);
  });

  test('targetTypeOptions returns expected object', function (assert) {
    let controller = this.owner.lookup('controller:scopes/scope/targets/index');
    assert.deepEqual(controller.targetTypeOptions, [
      { id: TYPE_TARGET_TCP, name: 'Generic TCP' },
      { id: TYPE_TARGET_SSH, name: 'SSH' },
    ]);
  });

  test('filters returns expected entries', function (assert) {
    let controller = this.owner.lookup('controller:scopes/scope/targets/index');
    assert.ok(controller.filters.allFilters);
    assert.ok(controller.filters.selectedFilters);
  });

  test('handleSearchInput action sets expected values correctly', async function (assert) {
    let controller = this.owner.lookup('controller:scopes/scope/targets/index');
    const searchValue = 'test';
    controller.handleSearchInput({ target: { value: searchValue } });
    await waitUntil(() => controller.search === searchValue);

    assert.strictEqual(controller.page, 1);
    assert.strictEqual(controller.search, searchValue);
  });

  test('applyFilter action sets expected values correctly', async function (assert) {
    let controller = this.owner.lookup('controller:scopes/scope/targets/index');
    const selectedItems = ['yes'];
    controller.applyFilter('availableSessions', selectedItems);

    assert.strictEqual(controller.page, 1);
    assert.deepEqual(controller.availableSessions, selectedItems);
  });
});
