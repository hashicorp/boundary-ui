/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Abilities | Role', function (hooks) {
  setupTest(hooks);

  test('it reflects when a given role may set grants based on authorized_actions', function (assert) {
    const service = this.owner.lookup('service:can');
    const model = {
      authorized_actions: ['set-grants'],
    };
    assert.true(service.can('setGrants role', model));
    model.authorized_actions = [];
    assert.false(service.can('setGrants role', model));
  });

  test('it reflects when a given role may add principals based on authorized_actions', function (assert) {
    const service = this.owner.lookup('service:can');
    const model = {
      authorized_actions: ['add-principals'],
    };
    assert.true(service.can('addPrincipals role', model));
    model.authorized_actions = [];
    assert.false(service.can('addPrincipals role', model));
  });

  test('it reflects when a given role may remove principals based on authorized_actions', function (assert) {
    const service = this.owner.lookup('service:can');
    const model = {
      authorized_actions: ['remove-principals'],
    };
    assert.true(service.can('removePrincipals role', model));
    model.authorized_actions = [];
    assert.false(service.can('removePrincipals role', model));
  });

  test('it proxies role principal read ability to the appropriate ability type', function (assert) {
    const service = this.owner.lookup('service:can');
    const user = {
      constructor: { modelName: 'user' },
      authorized_actions: [],
    };
    const group = {
      constructor: { modelName: 'group' },
      authorized_actions: [],
    };
    const managedGroup = {
      constructor: { modelName: 'managed-group' },
      authorized_actions: [],
    };
    assert.false(service.can('readPrincipal role', user));
    assert.false(service.can('readPrincipal role', group));
    assert.false(service.can('readPrincipal role', managedGroup));
    user.authorized_actions.push('read');
    group.authorized_actions.push('read');
    managedGroup.authorized_actions.push('read');
    assert.true(service.can('readPrincipal role', user));
    assert.true(service.can('readPrincipal role', group));
    assert.true(service.can('readPrincipal role', managedGroup));
  });

  test('it throws an error for unknown principal types on principal read check', function (assert) {
    const service = this.owner.lookup('service:can');
    const account = {
      constructor: { modelName: 'account' },
      authorized_actions: ['read'],
    };
    assert.throws(() => {
      service.can('readPrincipal role', account);
    });
    assert.true(service.can('read account', account));
  });

  test('can set grant scopes based on authorized_actions', function (assert) {
    const service = this.owner.lookup('service:can');
    const model = {
      authorized_actions: ['set-grant-scopes'],
    };
    assert.true(service.can('setGrantScopes role', model));
    model.authorized_actions = [];
    assert.false(service.can('setGrantScopes role', model));
  });
});
