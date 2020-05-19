import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import config from 'ember-get-config';

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
});
