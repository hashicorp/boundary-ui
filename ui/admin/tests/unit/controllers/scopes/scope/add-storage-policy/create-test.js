/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

module(
  'Unit | Controller | scopes/scope/add-storage-policy/create',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);

    let store;
    let controller;

    const instances = {
      scopes: {
        global: null,
      },
      policy: null,
    };

    const urls = {
      globalScope: null,
      addStoragePolicy: null,
    };

    hooks.beforeEach(async function () {
      await authenticateSession({});
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/add-storage-policy/create',
      );

      instances.scopes.global = this.server.create('scope', { id: 'global' });
      instances.policy = this.server.create('policy', {
        scopeId: 'global',
      });

      urls.globalScope = `/scopes/global`;
      urls.addStoragePolicy = `${urls.globalScope}/add-storage-policy`;
    });

    test('it exists', function (assert) {
      assert.ok(controller);
    });

    test('cancel action rolls-back changes on the specified model', async function (assert) {
      await visit(urls.addStoragePolicy);
      const policyBefore = await store.findRecord(
        'policy',
        instances.policy.id,
      );
      policyBefore.name = 'test';

      assert.strictEqual(policyBefore.name, 'test');

      await controller.cancel(policyBefore);
      const policyAfter = await store.findRecord('policy', instances.policy.id);

      assert.notEqual(policyAfter.name, 'test');
      assert.deepEqual(policyBefore, policyAfter);
    });

    test('save action saves changes on the specified model', async function (assert) {
      await visit(urls.addStoragePolicy);
      const policyBefore = await store.findRecord(
        'policy',
        instances.policy.id,
      );
      policyBefore.name = 'test';

      await controller.save(policyBefore);
      const policyAfter = await store.findRecord('policy', instances.policy.id);

      assert.strictEqual(policyAfter.name, 'test');
    });
  },
);
