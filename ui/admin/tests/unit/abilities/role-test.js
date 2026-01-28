/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Abilities | role', function (hooks) {
  setupTest(hooks);

  let canService;
  let store;

  hooks.beforeEach(function () {
    canService = this.owner.lookup('service:can');
    store = this.owner.lookup('service:store');
  });

  test('can setGrantScopes on role when authorized and scope is global type', function (assert) {
    const globalScope = store.createRecord('scope', { id: 'global' });
    const role = store.createRecord('role', {
      authorized_actions: ['set-grant-scopes'],
      scope: globalScope,
    });
    assert.true(canService.can('setGrantScopes role', role));
    role.authorized_actions = [];
    assert.false(canService.can('setGrantScopes role', role));
  });

  test('can setGrantScopes on role when authorized and scope is org type', function (assert) {
    const globalScope = store.createRecord('scope', { id: 'global' });
    const orgScope = store.createRecord('scope', {
      type: 'org',
      scope: globalScope,
    });
    const role = store.createRecord('role', {
      authorized_actions: ['set-grant-scopes'],
      scope: orgScope,
    });
    assert.true(canService.can('setGrantScopes role', role));
    role.authorized_actions = [];
    assert.false(canService.can('setGrantScopes role', role));
  });

  test('cannot setGrantScopes on role when authorized and scope is project type', function (assert) {
    const globalScope = store.createRecord('scope', { id: 'global' });
    const orgScope = store.createRecord('scope', {
      type: 'org',
      scope: globalScope,
    });
    const projectScope = store.createRecord('scope', {
      type: 'project',
      scope: orgScope,
    });
    const role = store.createRecord('role', {
      authorized_actions: ['set-grant-scopes'],
      scope: projectScope,
    });
    assert.false(canService.can('setGrantScopes role', role));
    role.authorized_actions = [];
    assert.false(canService.can('setGrantScopes role', role));
  });
});
