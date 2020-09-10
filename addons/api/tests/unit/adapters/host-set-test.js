import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | host set', function(hooks) {
  setupTest(hooks);

  test('it generates correct complete URLs', function (assert) {
    assert.expect(2);
    const scopeID = 'o_1';
    const hostCatalogID = 'hc_098';
    const method = 'my-custom-method';
    const mockSnapshot = {
      adapterOptions: {
        scopeID,
        method
      }
    };
    const adapter = this.owner.lookup('adapter:host-set');
    // Without hostCatalogID...
    let url = adapter.buildURL('host-set', null, mockSnapshot, 'findAll');
    assert.equal(url, '/v1/scopes/o_1/host-sets:my-custom-method');
    // With hostCatalogID...
    mockSnapshot.adapterOptions.hostCatalogID = hostCatalogID;
    url = adapter.buildURL('host-set', null, mockSnapshot, 'findAll');
    assert.equal(url, '/v1/host-catalogs/hc_098/host-sets:my-custom-method');
  });

});
