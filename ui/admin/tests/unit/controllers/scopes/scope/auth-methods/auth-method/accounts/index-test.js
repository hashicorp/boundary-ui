/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import { setupMirage } from 'api/test-support/helpers/mirage';
import { setupIntl } from 'ember-intl/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';

module(
  'Unit | Controller | scopes/scope/auth-methods/auth-method/accounts/index',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en-us');

    let intl;
    let controller;
    let store;
    let getAccountCount;

    const instances = {
      scopes: {
        global: null,
      },
      authMethod: null,
      account: null,
    };

    const urls = {
      accounts: null,
    };

    hooks.beforeEach(async function () {
      intl = this.owner.lookup('service:intl');
      controller = this.owner.lookup(
        'controller:scopes/scope/auth-methods/auth-method/accounts/index',
      );
      store = this.owner.lookup('service:store');

      instances.scopes.global = this.server.create(
        'scope',
        { id: 'global' },
        'withGlobalAuth',
      );
      instances.authMethod = this.server.schema.authMethods.first();
      instances.account = this.server.schema.accounts.first();
      await authenticateSession({
        isGlobal: true,
        account_id: instances.account.id,
      });

      getAccountCount = () => this.server.schema.accounts.all().models.length;

      urls.accounts = `/scopes/global/auth-methods/${instances.authMethod.id}/accounts`;
    });

    test('it exists', function (assert) {
      assert.ok(controller);
      assert.ok(controller.authMethods);
    });

    test('cancel action rolls-back changes on the specified model', async function (assert) {
      await visit(urls.accounts);
      const account = await store.findRecord('account', instances.account.id);
      account.name = 'test';

      assert.strictEqual(account.name, 'test');

      await controller.cancel(account);

      assert.notEqual(account.name, 'test');
    });

    test('save action saves changes on the specified model', async function (assert) {
      await visit(urls.accounts);
      const account = await store.findRecord('account', instances.account.id);
      account.name = 'test';

      await controller.save(account);

      assert.strictEqual(account.name, 'test');
    });

    test('delete action destroys specified model', async function (assert) {
      const account = await store.findRecord('account', instances.account.id);
      const accountCount = getAccountCount();

      await controller.delete(account);

      assert.strictEqual(getAccountCount(), accountCount - 1);
    });

    test('messageDescription returns correct translation with list authorization', async function (assert) {
      await visit(urls.accounts);

      assert.strictEqual(
        controller.messageDescription,
        intl.t('resources.account.description'),
      );
    });

    test('messageDescription returns correct translation with create authorization', async function (assert) {
      instances.authMethod.authorized_collection_actions.accounts = ['create'];
      await visit(urls.accounts);

      assert.strictEqual(
        controller.messageDescription,
        intl.t('descriptions.create-but-not-list', {
          resource: intl.t('resources.account.title_plural'),
        }),
      );
    });

    test('messageDescription returns correct translation with no authorization', async function (assert) {
      instances.authMethod.authorized_collection_actions.accounts = [];
      await visit(urls.accounts);

      assert.strictEqual(
        controller.messageDescription,
        intl.t('descriptions.neither-list-nor-create', {
          resource: intl.t('resources.account.title_plural'),
        }),
      );
    });
  },
);
