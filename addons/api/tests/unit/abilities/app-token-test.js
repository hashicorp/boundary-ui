/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Ability | app-token', function (hooks) {
  setupTest(hooks);

  let canService;
  let store;

  hooks.beforeEach(function () {
    canService = this.owner.lookup('service:can');
    store = this.owner.lookup('service:store');
  });

  test.each(
    'can perform action on app-token when authorized',
    [
      { perm: 'read', actions: ['read', 'read:self'] },
      { perm: 'read', actions: ['read'] },
      { perm: 'read', actions: ['read:self'] },
      { perm: 'revoke', actions: ['revoke', 'revoke:self'] },
      { perm: 'revoke', actions: ['revoke'] },
      { perm: 'revoke', actions: ['revoke:self'] },
      { perm: 'delete', actions: ['delete', 'delete:self'] },
      { perm: 'delete', actions: ['delete'] },
      { perm: 'delete', actions: ['delete:self'] },
    ],
    function (assert, input) {
      const appToken = store.createRecord('app-token', {
        authorized_actions: input.actions,
      });

      assert.true(canService.can(`${input.perm} app-token`, appToken));
    },
  );

  test.each(
    'cannot perform action on app-token when unauthorized',
    [
      { perm: 'read', actions: ['delete'] },
      { perm: 'revoke', actions: ['read'] },
      { perm: 'delete', actions: ['revoke'] },
    ],
    function (assert, input) {
      const appToken = store.createRecord('app-token', {
        authorized_actions: input.actions,
      });

      assert.false(canService.can(`${input.perm} app-token`, appToken));
    },
  );

  test('can clone app-token when authorized', function (assert) {
    const scope = store.createRecord('scope', {
      type: 'global',
      id: 'global',
      authorized_collection_actions: { 'app-token': ['create'] },
    });
    const appToken = store.createRecord('app-token', {
      scope,
      authorized_actions: ['read'],
    });

    assert.true(canService.can('clone app-token', appToken));
  });

  test('cannot clone app-token when unauthorized', function (assert) {
    const scope = store.createRecord('scope', {
      type: 'global',
      id: 'global',
      authorized_collection_actions: { 'app-token': ['create'] },
    });
    const appToken = store.createRecord('app-token', {
      scope,
      authorized_actions: [],
    });

    assert.false(canService.can('clone app-token', appToken));
  });
});
