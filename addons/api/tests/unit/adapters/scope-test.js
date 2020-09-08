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
  
});
