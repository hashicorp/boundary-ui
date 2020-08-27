import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Unit | Model | target', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it has a `hostSets` array of resolved model instances (if those instances are already in the store)', function(assert) {
    assert.expect(6);
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'target',
        attributes: {
          host_sets: [
            { host_set_id: '1', host_catalog_id: '2' },
            { host_set_id: '3', host_catalog_id: '2' }
          ]
        }
      }
    });
    const target = store.peekRecord('target', '123abc');
    assert.equal(target.host_sets.length, 2, 'Target has two entires in host_sets');
    assert.equal(target.hostSets.length, 0, 'Target has no resolved hostSets because they are not loaded yet');
    store.push({
      data: {
        id: '1',
        type: 'host-set',
        attributes: {}
      }
    });
    store.push({
      data: {
        id: '3',
        type: 'host-set',
        attributes: {}
      }
    });
    // Since `hostSets` is computed on `host_sets`, not the store itself,
    // it's necessary to do this assignment to kick-off the computed update.
    // eslint-disable-next-line no-self-assign
    target.host_sets = target.host_sets;
    assert.equal(target.host_sets.length, 2, 'Target has two entires in host_sets');
    assert.equal(target.hostSets.length, 2, 'Target has two resolved hostSets');
    assert.notOk(target.hostSets[0].hostCatalog, 'Host catalog was not resolved because it is not loaded yet');
    store.push({
      data: {
        id: '2',
        type: 'host-catalog',
        attributes: {}
      }
    });
    // eslint-disable-next-line no-self-assign
    target.host_sets = target.host_sets;
    assert.ok(target.hostSets[0].hostCatalog, 'Host catalog is resolved');
  });

  test('it has an `addHostSets` method that targets a specific POST API endpoint and serialization', async function (assert) {
    assert.expect(1);
    this.server.post('/v1/scopes/o_1/targets/123abc:add-host-sets', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      assert.deepEqual(body, {
        host_set_ids: ['123_abc', 'foobar'],
        version: 1
      });
    });
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'target',
        attributes: {
          name: 'Target',
          description: 'Description',
          host_sets: [
            { host_set_id: '1', host_catalog_id: '2' },
            { host_set_id: '3', host_catalog_id: '4' }
          ],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope'
          }
        }
      }
    });
    const model = store.peekRecord('target', '123abc');
    await model.addHostSets(['123_abc', 'foobar']);
  });

  test('it has a `deleteHostSets` method that targets a specific POST API endpoint and serialization', async function (assert) {
    assert.expect(1);
    this.server.post('/v1/scopes/o_1/targets/123abc:delete-host-sets', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      assert.deepEqual(body, {
        host_set_ids: ['1', '3'],
        version: 1
      });
    });
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'target',
        attributes: {
          name: 'Target',
          description: 'Description',
          host_sets: [
            { host_set_id: '1', host_catalog_id: '2' },
            { host_set_id: '3', host_catalog_id: '4' }
          ],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope'
          }
        }
      }
    });
    const model = store.peekRecord('target', '123abc');
    await model.deleteHostSets(['1', '3']);
  });

  test('it has a `deleteHostSet` method that deletes a single host set using `deleteHostSets` method', async function (assert) {
    assert.expect(1);
    this.server.post('/v1/scopes/o_1/targets/123abc:delete-host-sets', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      assert.deepEqual(body, {
        host_set_ids: ['3'],
        version: 1
      });
    });
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'target',
        attributes: {
          name: 'Target',
          description: 'Description',
          host_sets: [
            { host_set_id: '1', host_catalog_id: '2' },
            { host_set_id: '3', host_catalog_id: '4' }
          ],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope'
          }
        }
      }
    });
    const model = store.peekRecord('target', '123abc');
    await model.deleteHostSet('3');
  });
});
