import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Abilities | credential', function (hooks) {
  setupTest(hooks);

  test('canRead', function (assert) {
    assert.expect(3);
    const service = this.owner.lookup('service:can');
    const credential = {
      authorized_actions: ['read'],
      type: 'json'
    };
    assert.ok(
      service.can('read credential', credential)
    );
    credential.type = 'username_password'
    assert.ok(
      service.can('read credential', credential)
    );
    credential.type = 'ssh_private_key'
    assert.ok(
      service.can('read credential', credential)
    );
  });

  test('cannot read without proper authorized actions', function (assert) {
    assert.expect(3);
    const service = this.owner.lookup('service:can');
    const credential = {
      authorized_actions: [],
      type: 'json'
    };
    assert.notOk(
      service.can('read credential', credential)
    );
    credential.type = 'username_password'
    assert.notOk(
      service.can('read credential', credential)
    );
    credential.type = 'ssh_private_key'
    assert.notOk(
      service.can('read credential', credential)
    );
  });

  test('cannot read without proper authorized actions and json-credentials disabled', function (assert) {
    assert.expect(3);
    const service = this.owner.lookup('service:can');
    const featuresService = this.owner.lookup('service:features');
    featuresService.disable('json-credentials');
    const credential = {
      authorized_actions: [],
      type: 'json'
    };
    assert.notOk(
      service.can('read credential', credential)
    );
    credential.type = 'username_password'
    assert.notOk(
      service.can('read credential', credential)
    );
    credential.type = 'ssh_private_key'
    assert.notOk(
      service.can('read credential', credential)
    );
  });

  test('cannot read when json-credentials is disabled', function (assert) {
    assert.expect(3);
    const service = this.owner.lookup('service:can');
    const featuresService = this.owner.lookup('service:features');
    featuresService.disable('json-credentials');
    const credential = {
      authorized_actions: ['read'],
      type: 'json'
    };
    assert.notOk(
      service.can('read credential', credential)
    );
    credential.type = 'username_password'
    assert.ok(
      service.can('read credential', credential)
    );
    credential.type = 'ssh_private_key'
    assert.ok(
      service.can('read credential', credential)
    );
  });
});
