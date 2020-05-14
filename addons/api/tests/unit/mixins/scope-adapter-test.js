import RESTAdapter from '@ember-data/adapter/rest';
import ScopeAdapterMixin from 'api/mixins/scope-adapter';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Mixin | scope-adapter', function (hooks) {
  setupTest(hooks);

  test('it does not interfere with basic URLs', function (assert) {
    assert.expect(1);
    //const service = this.owner.lookup('service:scope');
    const ScopeAdapter = RESTAdapter.extend(ScopeAdapterMixin);
    this.owner.register('adapter:scope', ScopeAdapter);
    const adapter = this.owner.lookup('adapter:scope');
    const url = adapter._buildURL('model', 1);
    assert.equal(url, '/models/1');
  });

  test('it does not interfere with namespaced URLs', function (assert) {
    assert.expect(1);
    //const service = this.owner.lookup('service:scope');
    const ScopeAdapter = RESTAdapter.extend(ScopeAdapterMixin, {
      namespace: 'api/v1',
    });
    this.owner.register('adapter:scope', ScopeAdapter);
    const adapter = this.owner.lookup('adapter:scope');
    const url = adapter._buildURL('model', 1);
    assert.equal(url, '/api/v1/models/1');
  });

  test('it adds a scope to basic URLs when scope is set', function (assert) {
    assert.expect(4);
    const service = this.owner.lookup('service:scope');
    service.org = { id: 1 };
    const ScopeAdapter = RESTAdapter.extend(ScopeAdapterMixin, {
      namespace: 'api/v1',
    });
    this.owner.register('adapter:scope', ScopeAdapter);
    const adapter = this.owner.lookup('adapter:scope');
    let url = adapter._buildURL('model', 1);
    assert.equal(url, '/api/v1/orgs/1/models/1');
    service.project = { id: 2 };
    url = adapter._buildURL('model', 1);
    assert.equal(url, '/api/v1/orgs/1/projects/2/models/1');
    service.org = { id: 'foobar' };
    url = adapter._buildURL('model', 1);
    assert.equal(url, '/api/v1/orgs/foobar/projects/2/models/1');
    // can't have a project without an org
    service.org = null;
    url = adapter._buildURL('model', 1);
    assert.equal(url, '/api/v1/models/1');
  });
});
