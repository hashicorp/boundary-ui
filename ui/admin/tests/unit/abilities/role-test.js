/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Abilities | role', function (hooks) {
  setupTest(hooks);

  let abilitiesService;
  let store;

  hooks.beforeEach(function () {
    abilitiesService = this.owner.lookup('service:abilities');
    store = this.owner.lookup('service:store');
  });

  test('can setGrantScopes on role when authorized and scope is global type', function (assert) {
    const globalScope = store.createRecord('scope', { id: 'global' });
    const role = store.createRecord('role', {
      authorized_actions: ['set-grant-scopes'],
      scope: globalScope,
    });
    assert.true(abilitiesService.can('setGrantScopes role', role));
    role.authorized_actions = [];
    assert.false(abilitiesService.can('setGrantScopes role', role));
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
    assert.true(abilitiesService.can('setGrantScopes role', role));
    role.authorized_actions = [];
    assert.false(abilitiesService.can('setGrantScopes role', role));
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
    assert.false(abilitiesService.can('setGrantScopes role', role));
    role.authorized_actions = [];
    assert.false(abilitiesService.can('setGrantScopes role', role));
  });
});
