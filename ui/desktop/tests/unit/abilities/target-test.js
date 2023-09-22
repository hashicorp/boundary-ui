/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Abilities | target', function (hooks) {
  setupTest(hooks);

  test('it reflects when a target can initiate connection or not', function (assert) {
    assert.expect(5);
    const service = this.owner.lookup('service:can');
    const model = {
      address: '',
    };
    assert.false(service.can('initiateConnection target', model));
    model.host_sources = [];
    assert.false(service.can('initiateConnection target', model));
    model.address = 'localhost';
    assert.true(service.can('initiateConnection target', model));
    model.address = '';
    model.host_sources = ['host_123'];
    assert.true(service.can('initiateConnection target', model));
    model.address = 'localhost';
    model.host_sources = ['host_123'];
    assert.true(service.can('initiateConnection target', model));
  });
});
