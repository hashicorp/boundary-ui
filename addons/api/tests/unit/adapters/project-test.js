import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import config from 'ember-get-config';

module('Unit | Adapter | project', function (hooks) {
  setupTest(hooks);

  test('it generates URL prefixes without project scope', function (assert) {
    assert.expect(1);
    const service = this.owner.lookup('service:scope');
    service.org = { id: 1 };
    service.project = { id: 2 };
    const adapter = this.owner.lookup('adapter:project');
    assert.equal(adapter.urlPrefix(), `${config.api.namespace}/orgs/1`);
  });
});
