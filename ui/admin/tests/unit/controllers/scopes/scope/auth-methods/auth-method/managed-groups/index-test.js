/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'api/test-support/helpers/mirage';
import { setupIntl } from 'ember-intl/test-support';
import { visit } from '@ember/test-helpers';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { TYPE_AUTH_METHOD_LDAP } from 'api/models/auth-method';

module(
  'Unit | Controller | scopes/scope/auth-methods/auth-method/managed-groups/index',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en-us');

    let intl;
    let controller;
    let store;
    let getManagedGroupCount;

    const instances = {
      scopes: {
        global: null,
      },
      authMethod: null,
      managedGroup: null,
    };

    const urls = {
      managedGroups: null,
    };

    hooks.beforeEach(async function () {
      intl = this.owner.lookup('service:intl');
      controller = this.owner.lookup(
        'controller:scopes/scope/auth-methods/auth-method/managed-groups/index',
      );
      store = this.owner.lookup('service:store');

      instances.scopes.global = this.server.create(
        'scope',
        { id: 'global' },
        'withGlobalAuth',
      );
      await authenticateSession({
        isGlobal: true,
        account_id: this.server.schema.accounts.first().id,
      });
      instances.authMethod = this.server.create('auth-method', {
        scope: instances.scopes.global,
        type: TYPE_AUTH_METHOD_LDAP,
      });
      instances.managedGroup = this.server.create('managed-group', {
        scope: instances.scopes.global,
        authMethod: instances.authMethod,
      });

      getManagedGroupCount = () =>
        this.server.schema.managedGroups.all().models.length;

      urls.managedGroups = `/scopes/global/auth-methods/${instances.authMethod.id}/managed-groups`;
    });

    test('it exists', function (assert) {
      assert.ok(controller);
      assert.ok(controller.authMethods);
    });

    test('cancel action rolls-back changes on the specified model', async function (assert) {
      await visit(urls.managedGroups);
      const managedGroup = await store.findRecord(
        'managed-group',
        instances.managedGroup.id,
      );
      managedGroup.name = 'test';

      assert.strictEqual(managedGroup.name, 'test');

      await controller.cancel(managedGroup);

      assert.notEqual(managedGroup.name, 'test');
    });

    test('save action saves changes on the specified model', async function (assert) {
      await visit(urls.managedGroups);
      const managedGroup = await store.findRecord(
        'managed-group',
        instances.managedGroup.id,
      );
      managedGroup.name = 'test';

      await controller.save(managedGroup);

      assert.strictEqual(managedGroup.name, 'test');
    });

    test('delete action destroys specified model', async function (assert) {
      const managedGroup = await store.findRecord(
        'managed-group',
        instances.managedGroup.id,
      );
      const managedGroupCount = getManagedGroupCount();

      await controller.delete(managedGroup);

      assert.strictEqual(getManagedGroupCount(), managedGroupCount - 1);
    });

    test('edit action updates to a dirty state', async function (assert) {
      const managedGroup = await store.findRecord(
        'managed-group',
        instances.managedGroup.id,
      );

      assert.false(managedGroup.hasDirtyAttributes);

      controller.edit(managedGroup);

      assert.true(managedGroup.hasDirtyAttributes);
    });

    test('messageDescription returns correct translation with list authorization', async function (assert) {
      await visit(urls.managedGroups);

      assert.strictEqual(
        controller.messageDescription,
        intl.t('resources.managed-group.description'),
      );
    });

    test('messageDescription returns correct translation with create authorization', async function (assert) {
      instances.authMethod.authorized_collection_actions['managed-groups'] = [
        'create',
      ];
      await visit(urls.managedGroups);

      assert.strictEqual(
        controller.messageDescription,
        intl.t('descriptions.create-but-not-list', {
          resource: intl.t('resources.managed-group.title_plural'),
        }),
      );
    });

    test('messageDescription returns correct translation with no authorization', async function (assert) {
      instances.authMethod.authorized_collection_actions['managed-groups'] = [];
      await visit(urls.managedGroups);

      assert.strictEqual(
        controller.messageDescription,
        intl.t('descriptions.neither-list-nor-create', {
          resource: intl.t('resources.managed-group.title_plural'),
        }),
      );
    });
  },
);
