import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { disableFeature, enableFeature } from '../../helpers/features-service';

module('Unit | Abilities | credential', function (hooks) {
  setupTest(hooks);

  let service, store;

  hooks.beforeEach(function () {
    service = this.owner.lookup('service:can');
    store = this.owner.lookup('service:store');
  });

  test('can read credentials, including JSON credentials, when authorized and json-credentials feature is enabled', function (assert) {
    assert.expect(3);
    enableFeature('json-credentials');
    const credential = store.createRecord('credential', {
      authorized_actions: ['read'],
      type: 'json',
    });
    assert.true(service.can('read credential', credential));
    credential.type = 'username_password';
    assert.true(service.can('read credential', credential));
    credential.type = 'ssh_private_key';
    assert.true(service.can('read credential', credential));
  });

  test('cannot read credentials, including JSON credentials, when unauthorized and json-credentials feature is enabled', function (assert) {
    assert.expect(3);
    enableFeature('json-credentials');
    const credential = store.createRecord('credential', {
      authorized_actions: [],
      type: 'json',
    });
    assert.false(service.can('read credential', credential));
    credential.type = 'username_password';
    assert.false(service.can('read credential', credential));
    credential.type = 'ssh_private_key';
    assert.false(service.can('read credential', credential));
  });

  test('cannot read credentials, including JSON credentials, when unauthorized and json-credentials feature is disabled', function (assert) {
    assert.expect(3);
    disableFeature('json-credentials');
    const credential = store.createRecord('credential', {
      authorized_actions: [],
      type: 'json',
    });
    assert.false(service.can('read credential', credential));
    credential.type = 'username_password';
    assert.false(service.can('read credential', credential));
    credential.type = 'ssh_private_key';
    assert.false(service.can('read credential', credential));
  });

  test('can read credentials, excepting JSON credentials, when authorized and json-credentials feature is disabled', function (assert) {
    assert.expect(3);
    disableFeature('json-credentials');
    const credential = store.createRecord('credential', {
      authorized_actions: ['read'],
      type: 'json',
    });
    assert.false(service.can('read credential', credential));
    credential.type = 'username_password';
    assert.true(service.can('read credential', credential));
    credential.type = 'ssh_private_key';
    assert.true(service.can('read credential', credential));
  });
});
