import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | scope', function (hooks) {
  setupTest(hooks);

  test('it can contain org scope', function (assert) {
    let service = this.owner.lookup('service:scope');
    service.org = {};
    assert.ok(service.org, 'Service contains org scope');
  });

  test('it can contain project scope', function (assert) {
    let service = this.owner.lookup('service:scope');
    service.project = {};
    assert.ok(service.project, 'Service contains project scope');
  });
});
