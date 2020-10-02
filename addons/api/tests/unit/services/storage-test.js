import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | storage', function (hooks) {
  setupTest(hooks);

  test('it can persist values', function (assert) {
    assert.expect(1);
    const service = this.owner.lookup('service:storage');
    service.setItem('foo', 'bar');
    assert.equal(service.getItem('foo'), 'bar');
  });

  test('it can remove persisted values', function (assert) {
    assert.expect(2);
    const service = this.owner.lookup('service:storage');
    service.setItem('foo', 'bar');
    assert.equal(service.getItem('foo'), 'bar');
    service.removeItem('foo');
    assert.notOk(service.getItem('foo'));
  });

  // NOTE:  the following tests are order-dependent, so may be invalidated
  // if we switch to random test ordering

  test("it's in-memory storage is implicitly refreshed for every test case", function (assert) {
    assert.expect(1);
    const service = this.owner.lookup('service:storage');
    service.setItem('foo', 'bar');
    assert.equal(service.getItem('foo'), 'bar');
  });

  test("it's in-memory storage is implicitly refreshed for every test case", function (assert) {
    assert.expect(1);
    const service = this.owner.lookup('service:storage');
    assert.notOk(service.getItem('foo'));
  });
});
