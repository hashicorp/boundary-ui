/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { currentURL, visit } from '@ember/test-helpers';
import { setupMirage } from 'admin/tests/helpers/mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

module(
  'Unit | Controller | scopes/scope/workers/worker/create-tags',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);

    let store;
    let controller;

    const instances = {
      scopes: {
        global: null,
      },
      worker: null,
    };

    const urls = {
      workers: null,
      tags: null,
      createTags: null,
    };

    hooks.beforeEach(async function () {
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/workers/worker/create-tags',
      );

      instances.scopes.global = this.server.create(
        'scope',
        { id: 'global' },
        'withGlobalAuth',
      );
      await authenticateSession({
        isGlobal: true,
        account_id: this.server.schema.accounts.first().id,
      });
      instances.worker = this.server.create('worker', {
        scope: instances.scopes.global,
      });

      urls.workers = `/scopes/global/workers`;
      urls.tags = `${urls.workers}/${instances.worker.id}/tags`;
      urls.createTags = `${urls.workers}/${instances.worker.id}/create-tags`;
    });

    test('it exists', function (assert) {
      assert.ok(controller);
    });

    test('save action sets api tags for a worker', async function (assert) {
      await visit(urls.createTags);
      const worker = await store.findRecord('worker', instances.worker.id);
      const apiTags = { key: ['value'] };

      await controller.save(apiTags);

      assert.deepEqual(worker.api_tags, apiTags);
    });

    test('cancel action clears api tags for a worker and transitions to tags route', async function (assert) {
      await visit(urls.createTags);
      controller.apiTags = [{ key: 'key', value: 'value' }];

      await controller.cancel();

      assert.deepEqual(controller.apiTags, []);
      assert.strictEqual(currentURL(), urls.tags);
    });
  },
);
