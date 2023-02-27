/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Abilities | Group', function (hooks) {
  setupTest(hooks);

  test('it reflects when a given group resource may add members based on authorized_actions', function (assert) {
    assert.expect(2);
    const service = this.owner.lookup('service:can');
    const model = {
      authorized_actions: ['add-members'],
    };
    assert.ok(service.can('addMembers group', model));
    model.authorized_actions = [];
    assert.notOk(service.can('addMembers group', model));
  });

  test('it reflects when a given group resource may remove members based on authorized_actions', function (assert) {
    assert.expect(2);
    const service = this.owner.lookup('service:can');
    const model = {
      authorized_actions: ['remove-members'],
    };
    assert.ok(service.can('removeMembers group', model));
    model.authorized_actions = [];
    assert.notOk(service.can('removeMembers group', model));
  });
});
