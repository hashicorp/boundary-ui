/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit, currentURL, settled } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module(
  'Unit | Controller | scopes/scope/authenticate/method/index',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);

    let controller;
    let store;
    let session;

    const instances = {
      scopes: {
        global: null,
        org: null,
      },
      authMethod: null,
      account: null,
    };

    const urls = {
      globalScope: null,
      authenticate: null,
    };

    hooks.beforeEach(async function () {
      controller = this.owner.lookup(
        'controller:scopes/scope/authenticate/method/index',
      );
      store = this.owner.lookup('service:store');
      session = this.owner.lookup('service:session');

      instances.scopes.global = this.server.create(
        'scope',
        { id: 'global' },
        'withGlobalAuth',
      );
      instances.authMethod = this.server.schema.authMethods.first();
      instances.account = this.server.schema.accounts.first();
      instances.scopes.org = this.server.create('scope', {
        type: 'org',
        scope: { id: 'global', type: 'global' },
      });

      urls.globalScope = '/scopes/global/scopes';
      urls.authenticate = `scopes/global/authenticate/${instances.authMethod}`;
    });

    test('authenticate action saves auth information and redirects to correct page', async function (assert) {
      await visit(urls.authenticate);
      const identification = instances.account.attributes.login_name;
      const authMethod = await store.findRecord(
        'auth-method',
        instances.authMethod.id,
      );
      const { authenticator: authBefore, account_id: accountIdBefore } =
        session.data.authenticated;

      assert.notOk(accountIdBefore);
      assert.notOk(authBefore);
      assert.ok(identification);

      await controller.authenticate(authMethod, {
        identification,
        password: 'password',
      });
      await settled();

      const { authenticator: authAfter, account_id: accountIdAfter } =
        session.data.authenticated;
      assert.strictEqual(
        authAfter,
        `authenticator:${instances.authMethod.type}`,
      );
      assert.strictEqual(accountIdAfter, instances.account.id);
      assert.strictEqual(currentURL(), urls.globalScope);
    });
  },
);
