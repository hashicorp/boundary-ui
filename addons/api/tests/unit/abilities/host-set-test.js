/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Abilities | Host Set', function (hooks) {
  setupTest(hooks);

  test('it reflects when a given host set resource may add hosts based on authorized_actions', function (assert) {
    const service = this.owner.lookup('service:can');
    const model = {
      authorized_actions: ['add-hosts'],
    };
    assert.ok(service.can('addHosts hostSet', model));
    model.authorized_actions = [];
    assert.notOk(service.can('addHosts hostSet', model));
  });

  test('it reflects when a given hostSet resource may remove hosts based on authorized_actions', function (assert) {
    const service = this.owner.lookup('service:can');
    const model = {
      authorized_actions: ['remove-hosts'],
    };
    assert.ok(service.can('removeHosts hostSet', model));
    model.authorized_actions = [];
    assert.notOk(service.can('removeHosts hostSet', model));
  });
});
