import { module, test } from 'qunit';
import { setupTest } from 'dummy/tests/helpers';
import Service from '@ember/service';

class SessionService extends Service {}

module('Unit | Service | indexed-db', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    this.owner.register('service:session', SessionService);

    let service = this.owner.lookup('service:indexed-db');
    assert.ok(service);
  });
});
