import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Unit | Model | target', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it exists', function(assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('target', {});
    assert.ok(model);
  });

  test('it has a `saveHostSets` method that targets a specific POST API endpoint and serialization', async function (assert) {
    assert.expect(1);
    this.server.post('/v1/scopes/o_1/targets/123abc:set-host-sets', (schema, request) => {
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
    await model.saveHostSets();
  });
});
