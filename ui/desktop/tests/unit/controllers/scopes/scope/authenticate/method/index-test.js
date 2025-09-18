/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { visit, currentURL, settled } from '@ember/test-helpers';
import { setupIntl } from 'ember-intl/test-support';
import WindowMockIPC from '../../../../../../helpers/window-mock-ipc';
import { TYPE_AUTH_METHOD_PASSWORD } from 'api/models/auth-method';

module(
  'Unit | Controller | scopes/scope/authenticate/method/index',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en-us');

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
      targets: null,
    };

    const setDefaultClusterUrl = (test) => {
      const windowOrigin = window.location.origin;
      const clusterUrl = test.owner.lookup('service:clusterUrl');
      clusterUrl.rendererClusterUrl = windowOrigin;
    };

    hooks.beforeEach(async function () {
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
      instances.account = this.server.create('account', {
        scope: instances.scopes.global,
        authMethod: instances.authMethod,
      });

      urls.targets = '/scopes/global/projects/targets';

      this.owner.register('service:browser/window', WindowMockIPC);
      setDefaultClusterUrl(this);
    });

    test('it exists', function (assert) {
      assert.ok(controller);
    });

    test('authenticate action saves login information', async function (assert) {
      await visit('/');
      const identification = instances.account.attributes.login_name;
      const authMethod = await store.findRecord(
        'auth-method',
        instances.authMethod.id,
      );
      const { authenticator: authBefore, username: usernameBefore } =
        session.data.authenticated;

      assert.notOk(usernameBefore);
      assert.notOk(authBefore);
      assert.ok(identification);

      await controller.authenticate(authMethod, {
        identification,
        password: 'password',
      });
      await settled();

      const { authenticator: authAfter, username: usernameAfter } =
        session.data.authenticated;

      assert.strictEqual(
        authAfter,
        `authenticator:${instances.authMethod.type}`,
      );
      assert.strictEqual(usernameAfter, identification);
      assert.strictEqual(currentURL(), urls.targets);
    });
  },
);
