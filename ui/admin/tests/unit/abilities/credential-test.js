/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Abilities | credential', function (hooks) {
  setupTest(hooks);

  let featuresService;

  hooks.beforeEach(function () {
    // Enable json-credentials feature by default
    featuresService = this.owner.lookup('service:features');
  });

  test('can read credentials, including JSON credentials, when authorized and json-credentials feature is enabled', function (assert) {
    assert.expect(3);
    featuresService.enable('json-credentials');
    const service = this.owner.lookup('service:can');
    const store = this.owner.lookup('service:store');
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
    featuresService.enable('json-credentials');
    const service = this.owner.lookup('service:can');
    const store = this.owner.lookup('service:store');
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
    assert.expect(4);
    const service = this.owner.lookup('service:can');
    const store = this.owner.lookup('service:store');
    const credential = store.createRecord('credential', {
      authorized_actions: [],
      type: 'json',
    });
    assert.false(featuresService.isEnabled('json-credentials'));
    assert.false(service.can('read credential', credential));
    credential.type = 'username_password';
    assert.false(service.can('read credential', credential));
    credential.type = 'ssh_private_key';
    assert.false(service.can('read credential', credential));
  });

  test('can read credentials, excepting JSON credentials, when authorized and json-credentials feature is disabled', function (assert) {
    assert.expect(4);
    const service = this.owner.lookup('service:can');
    const store = this.owner.lookup('service:store');
    const credential = store.createRecord('credential', {
      authorized_actions: ['read'],
      type: 'json',
    });
    assert.false(featuresService.isEnabled('json-credentials'));
    assert.false(service.can('read credential', credential));
    credential.type = 'username_password';
    assert.true(service.can('read credential', credential));
    credential.type = 'ssh_private_key';
    assert.true(service.can('read credential', credential));
  });
});
