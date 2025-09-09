/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { TYPE_AUTH_METHOD_PASSWORD } from 'api/models/auth-method';

module(
  'Unit | Controller | scopes/scope/authenticate/method/index',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);
    setupSqlite(hooks);

    let controller;
    let store;
    let session;

    const instances = {
      scopes: {
        global: null,
      },
      authMethod: null,
    };

    const urls = {
      globalScope: null,
      authenticate: null,
    };

    hooks.beforeEach(async function () {
      await authenticateSession({});
      controller = this.owner.lookup(
        'controller:scopes/scope/authenticate/method/index',
      );
      store = this.owner.lookup('service:store');
      session = this.owner.lookup('service:session');

      instances.scopes.global = this.server.create('scope', {
        id: 'global',
        type: 'global',
      });
      instances.authMethod = this.server.create('auth-method', {
        scope: instances.scopes.global,
        type: TYPE_AUTH_METHOD_PASSWORD,
      });

      urls.globalScope = '/scopes/global/scopes';
      urls.authenticate = `scopes/global/authenticate/${instances.authMethod}`;
    });

    test('authenticate action saves login information and redirects to correct page', async function (assert) {
      await visit(urls.authenticate);
      const identification = 'admin123';
      const authMethod = await store.findRecord(
        'auth-method',
        instances.authMethod.id,
      );
      const { authenticator: authBefore, username: usernameBefore } =
        session.data.authenticated;

      assert.notOk(usernameBefore);
      assert.strictEqual(authBefore, 'authenticator:test');

      await controller.authenticate(authMethod, {
        identification,
        password: 'password',
      });
      const { authenticator: authAfter, username: usernameAfter } =
        session.data.authenticated;

      assert.strictEqual(
        authAfter,
        `authenticator:${instances.authMethod.type}`,
      );
      assert.strictEqual(usernameAfter, identification);
    });
  },
);
