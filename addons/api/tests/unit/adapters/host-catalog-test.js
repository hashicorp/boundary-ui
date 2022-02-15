import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | host catalog', function (hooks) {
  setupTest(hooks);

  test('it generates correct createRecord URLs for static host catalogs', function (assert) {
    assert.expect(1);
    const scopeID = 'o_1';
    const mockSnapshot = {
      adapterOptions: {
        scopeID,
      },
      attr() {
        return null;
      },
    };
    const adapter = this.owner.lookup('adapter:host-catalog');
    const createRecordURL = adapter.buildURL(
      'host-catalog',
      null,
      mockSnapshot,
      'createRecord'
    );
    assert.equal(createRecordURL, '/v1/host-catalogs');
  });

  test('it generates correct createRecord URLs for dynamic host catalogs with extra query parameter ?plugin_name', function (assert) {
    assert.expect(1);
    const scopeID = 'o_1';
    const mockSnapshot = {
      adapterOptions: {
        scopeID,
      },
      attr() {
        return { name: 'aws' };
      },
    };
    const adapter = this.owner.lookup('adapter:host-catalog');
    const createRecordURL = adapter.buildURL(
      'host-catalog',
      null,
      mockSnapshot,
      'createRecord'
    );
    assert.equal(createRecordURL, '/v1/host-catalogs?plugin_name=aws');
  });
});
