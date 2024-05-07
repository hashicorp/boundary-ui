import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

module(
  'Unit | Controller | scopes/scope/add-storage-policy/index',
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
      authenticateSession({});
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/add-storage-policy/index',
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
      const scopeBefore = await store.findRecord(
        'scope',
        instances.scopes.global.id,
      );
      scopeBefore.storage_policy_id = instances.policy.id;

      assert.strictEqual(scopeBefore.storage_policy_id, instances.policy.id);

      await controller.cancel(scopeBefore);
      const scopeAfter = await store.findRecord(
        'scope',
        instances.scopes.global.id,
      );

      assert.notOk(scopeAfter.storage_policy_id);
      assert.deepEqual(scopeBefore, scopeAfter);
    });

    test('attachStoragePolicy action saves changes on the specified model', async function (assert) {
      await visit(urls.addStoragePolicy);
      const scopeBefore = await store.findRecord(
        'scope',
        instances.scopes.global.id,
      );
      scopeBefore.storage_policy_id = instances.policy.id;

      await controller.attachStoragePolicy(scopeBefore);
      const scopeAfter = await store.findRecord(
        'scope',
        instances.scopes.global.id,
      );

      assert.strictEqual(scopeAfter.storage_policy_id, instances.policy.id);
    });
  },
);
