import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { ResourceFilter } from 'api/services/resource-filter-store';

module('Unit | Service | resource-filter-store', function (hooks) {
  setupTest(hooks);

  test('it exports a ResourceFilter class that converts filterObjects to query expressions', function (assert) {
    assert.ok(ResourceFilter);
    const filter = new ResourceFilter({
      type: 'oidc',
      status: ['active', 'pending'],
    });
    const expected =
      '("/item/type" == "oidc") and ("/item/status" == "active" or "/item/status" == "pending")';
    assert.equal(filter.queryExpression, expected);
  });

  test('it accounts for empty arrays in filterObjects', function (assert) {
    assert.ok(ResourceFilter);
    const filter = new ResourceFilter({
      type: 'oidc',
      status: [],
    });
    const expected = '("/item/type" == "oidc")';
    assert.equal(filter.queryExpression, expected);
  });

  test('it accounts for empty strings in filterObjects', function (assert) {
    assert.ok(ResourceFilter);
    const filter = new ResourceFilter({
      type: '',
      status: ['active'],
    });
    const expected = '("/item/status" == "active")';
    assert.equal(filter.queryExpression, expected);
  });
});
