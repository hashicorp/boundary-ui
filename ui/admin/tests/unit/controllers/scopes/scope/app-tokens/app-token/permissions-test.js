/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'admin/tests/helpers';

module(
  'Unit | Controller | scopes/scope/app-tokens/app-token/permissions',
  function (hooks) {
    setupTest(hooks);

    let controller;

    hooks.beforeEach(async function () {
      controller = this.owner.lookup(
        'controller:scopes/scope/app-tokens/app-token/permissions',
      );
    });

    test('it exists', function (assert) {
      assert.ok(controller);
    });

    test('activeScopesList returns empty array when selectedPermission is null', function (assert) {
      controller.selectedPermission = null;

      assert.deepEqual(controller.activeScopesList, []);
    });

    test('activeScopesList returns empty array when grant_scopes is undefined', function (assert) {
      controller.selectedPermission = {};

      assert.deepEqual(controller.activeScopesList, []);
    });

    test('activeScopesList handles keyword scopes correctly', function (assert) {
      const store = this.owner.lookup('service:store');

      // Create a mock current scope
      const currentScope = store.push({
        data: {
          id: 'o_123456',
          type: 'scope',
          attributes: {
            name: 'Current Org',
          },
        },
      });

      // Mock the model with current scope
      controller.model = { scope: currentScope };
      controller.selectedPermission = {
        grant_scopes: ['this', 'children', 'descendants'],
      };

      const scopes = controller.activeScopesList;

      assert.strictEqual(scopes.length, 3);
      assert.strictEqual(scopes[0].id, 'this');
      assert.strictEqual(scopes[0].displayName, 'Current Org');
      assert.strictEqual(scopes[1].id, 'children');
      assert.strictEqual(scopes[1].displayName, '—');
      assert.true(scopes[1].isKeyword);
      assert.strictEqual(scopes[2].id, 'descendants');
      assert.strictEqual(scopes[2].displayName, '—');
      assert.true(scopes[2].isKeyword);
    });

    test('activeScopesList fetches scope models from store', function (assert) {
      const store = this.owner.lookup('service:store');

      // Create mock scope
      store.push({
        data: {
          id: 'p_123456',
          type: 'scope',
          attributes: {
            name: 'Test Scope',
          },
        },
      });

      controller.selectedPermission = {
        grant_scopes: ['p_123456'],
      };

      const scopes = controller.activeScopesList;

      assert.strictEqual(scopes.length, 1);
      assert.strictEqual(scopes[0].id, 'p_123456');
    });

    test('activeScopesList handles mixed keywords and scope IDs', function (assert) {
      const store = this.owner.lookup('service:store');

      const currentScope = store.push({
        data: {
          id: 'o_123456',
          type: 'scope',
          attributes: {
            name: 'Current Org',
          },
        },
      });

      store.push({
        data: {
          id: 'p_123456',
          type: 'scope',
          attributes: {
            name: 'Test Scope',
          },
        },
      });

      controller.model = { scope: currentScope };
      controller.selectedPermission = {
        grant_scopes: ['this', 'p_123456', 'children'],
      };

      const scopes = controller.activeScopesList;

      assert.strictEqual(scopes.length, 3);
      assert.strictEqual(scopes[0].id, 'this');
      assert.strictEqual(scopes[0].displayName, 'Current Org');
      assert.strictEqual(scopes[1].id, 'p_123456');
      assert.strictEqual(scopes[2].id, 'children');
      assert.true(scopes[2].isKeyword);
    });

    test('deletedScopesList returns empty array when selectedPermission is null', function (assert) {
      controller.selectedPermission = null;

      assert.deepEqual(controller.deletedScopesList, []);
    });

    test('deletedScopesList returns deleted_scopes array from selectedPermission', function (assert) {
      const deletedScopes = [
        { scope_id: 'p_123456', deleted_at: '2025-06-14T13:37:56Z' },
        { scope_id: 'p_789012', deleted_at: '2025-06-15T10:20:30Z' },
      ];
      controller.selectedPermission = {
        deleted_scopes: deletedScopes,
      };

      assert.deepEqual(controller.deletedScopesList, deletedScopes);
    });

    test('openGrantsFlyout sets selectedPermission and shows flyout', function (assert) {
      const permission = { grant: ['type=host;actions=read'] };

      controller.openGrantsFlyout(permission);

      assert.strictEqual(controller.selectedPermission, permission);
      assert.true(controller.showGrantsFlyout);
    });

    test('closeGrantsFlyout resets selectedPermission and hides flyout', function (assert) {
      controller.selectedPermission = { grant: ['type=host;actions=read'] };
      controller.showGrantsFlyout = true;

      controller.closeGrantsFlyout();

      assert.strictEqual(controller.selectedPermission, null);
      assert.false(controller.showGrantsFlyout);
    });

    test('openActiveScopesFlyout sets selectedPermission and shows flyout', function (assert) {
      const permission = { grant_scopes: ['this', 'p_123456'] };

      controller.openActiveScopesFlyout(permission);

      assert.strictEqual(controller.selectedPermission, permission);
      assert.true(controller.showActiveScopesFlyout);
    });

    test('closeActiveScopesFlyout resets selectedPermission and hides flyout', function (assert) {
      controller.selectedPermission = { grant_scopes: ['this'] };
      controller.showActiveScopesFlyout = true;

      controller.closeActiveScopesFlyout();

      assert.strictEqual(controller.selectedPermission, null);
      assert.false(controller.showActiveScopesFlyout);
    });

    test('openDeletedScopesFlyout sets selectedPermission and shows flyout', function (assert) {
      const permission = {
        deleted_scopes: [
          { scope_id: 'p_123456', deleted_at: '2025-06-14T13:37:56Z' },
        ],
      };

      controller.openDeletedScopesFlyout(permission);

      assert.strictEqual(controller.selectedPermission, permission);
      assert.true(controller.showDeletedScopesFlyout);
    });

    test('closeDeletedScopesFlyout resets selectedPermission and hides flyout', function (assert) {
      controller.selectedPermission = { deleted_scopes: [] };
      controller.showDeletedScopesFlyout = true;

      controller.closeDeletedScopesFlyout();

      assert.strictEqual(controller.selectedPermission, null);
      assert.false(controller.showDeletedScopesFlyout);
    });
  },
);
