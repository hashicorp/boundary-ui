/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'api/test-support/helpers/mirage';
import { visit, currentURL, settled } from '@ember/test-helpers';
import { setupIntl } from 'ember-intl/test-support';
import WindowMockIPC from '../../../../../../helpers/window-mock-ipc';

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

      instances.scopes.global = this.server.create(
        'scope',
        { id: 'global' },
        'withGlobalAuth',
      );
      instances.authMethod = this.server.schema.authMethods.first();
      instances.account = this.server.schema.accounts.first();

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
      assert.strictEqual(instances.account.id, accountIdAfter);
      assert.strictEqual(currentURL(), urls.targets);
    });
  },
);
