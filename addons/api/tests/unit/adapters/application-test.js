import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import config from 'ember-get-config';
import RESTAdapter from '@ember-data/adapter/rest';

module('Unit | Adapter | application', function (hooks) {
  setupTest(hooks);

  test('its namespace is equal to the configured namespace', function (assert) {
    assert.expect(2);
    const adapter = this.owner.lookup('adapter:application');
    assert.ok(adapter.namespace);
    assert.equal(adapter.namespace, config.api.namespace);
  });

  test('it generates correct URL prefixes', function (assert) {
    assert.expect(1);
    const adapter = this.owner.lookup('adapter:application');
    assert.equal(adapter.urlPrefix(), config.api.namespace);
  });

  test('it rewrites PUT to PATCH, but leaves others unchanged', function (assert) {
    assert.expect(1);
    const adapter = this.owner.lookup('adapter:application');
    // TODO this is icky, should be changed to a spy or stub
    RESTAdapter.prototype.ajax = (url, type) => {
      assert.equal(type, 'PATCH');
    };
    adapter.ajax('/', 'PUT');
  });
});
