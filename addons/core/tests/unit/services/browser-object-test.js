import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | browser-object', function (hooks) {
  setupTest(hooks);

  test('it contains a window', function (assert) {
    let service = this.owner.lookup('service:browser-object');
    assert.ok(service.window, 'Service contains a window');
  });

  test('it contains a document', function (assert) {
    let service = this.owner.lookup('service:browser-object');
    assert.ok(service.document, 'Service contains a document');
  });

  test('it contains a hostname', function (assert) {
    let service = this.owner.lookup('service:browser-object');
    assert.ok(service.hostname, 'Service contains a document');
  });
});
