import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Unit | Adapter | scope', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it does not prefix URLs with `scopeID` for scope resources', function (assert) {
    assert.expect(1);
    const scopeID = 'global';
    const adapter = this.owner.lookup('adapter:scope');
    const prefix = adapter.urlPrefix(null, null, 'scope', null, {
      adapterOptions: { scopeID }
    });
    assert.equal(prefix, `v1`);
  });
  
  test('it generates correct createRecord URLs with a scope_id query parameter', function (assert) {
    assert.expect(1);
    this.server.post('/v1/scopes', (schema, { queryParams }) =>{
      assert.equal(queryParams.scope_id, 'o_1');
    });
    const store = this.owner.lookup('service:store');
    const scope = store.createRecord('scope', {
      scopeID: 'o_1'
    });
    const type = scope.constructor;
    const snapshot = scope._createSnapshot();
    const adapter = this.owner.lookup('adapter:scope');
    adapter.createRecord(store, type, snapshot);
  });
});
