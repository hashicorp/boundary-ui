/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'admin/tests/helpers/mirage';
import { setupIntl } from 'ember-intl/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { HCP_MANAGED_KEY } from 'api/models/worker';

module(
  'Unit | Controller | scopes/scope/workers/worker/tags',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en-us');

    let store;
    let controller;
    const apiTags = { test: ['test'], key: ['value'] };

    const instances = {
      scopes: {
        global: null,
      },
      worker: null,
    };

    const urls = {
      workers: null,
      tags: null,
    };

    hooks.beforeEach(async function () {
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/workers/worker/tags',
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
        api_tags: apiTags,
      });
      urls.workers = `/scopes/global/workers`;
      urls.tags = `${urls.workers}/${instances.worker.id}/tags`;
    });

    test('it exists', function (assert) {
      assert.ok(controller);
      assert.ok(controller.workers);
    });

    test('tagDisplayName returns the display name of the tag', function (assert) {
      controller.modalTag = { key: 'test', value: 'test' };

      assert.strictEqual(controller.tagDisplayName, '"test = test"');
    });

    test('isRemovalConfirmed returns true if the user has entered REMOVE', function (assert) {
      controller.removalConfirmation = 'REMOVE';

      assert.true(controller.isRemovalConfirmed);
    });

    test('isRemovalConfirmed returns false if the user has entered anything but REMOVE', function (assert) {
      controller.removalConfirmation = 'remove';

      assert.false(controller.isRemovalConfirmed);
    });

    test('isHcpManged returns true if tag key matches `HCP_MANAGED_KEY` and value is true', async function (assert) {
      assert.true(
        controller.isHcpManaged({ key: HCP_MANAGED_KEY, value: 'true' }),
      );
    });

    test('isHcpManged returns false if tag key does not match `HCP_MANAGED_KEY` or value is not true', async function (assert) {
      assert.false(
        controller.isHcpManaged({ key: 'self.managed', value: 'true' }),
      );
      assert.false(
        controller.isHcpManaged({ key: HCP_MANAGED_KEY, value: 'false' }),
      );
    });

    test('removeApiTag calls removeApiTags on the model and closes modal', async function (assert) {
      await visit(urls.tags);
      const worker = await store.findRecord('worker', instances.worker.id);
      const apiTagCount = worker.apiTagList.length;
      controller.modalTag = { key: 'test', value: 'test' };

      await controller.removeApiTag();

      assert.strictEqual(worker.apiTagList.length, apiTagCount - 1);
      assert.false(controller.removeModal);
    });

    test('editApiTags calls setApiTags on the model and closes modal', async function (assert) {
      await visit(urls.tags);
      const worker = await store.findRecord('worker', instances.worker.id);

      assert.deepEqual(worker.api_tags, apiTags);

      // set controller values needed for editing
      controller.modalTag = { key: 'test', value: 'test' };
      controller.editKey = 'unit';
      controller.editValue = 'test';

      await controller.editApiTag();

      assert.deepEqual(worker.api_tags, { unit: ['test'], key: ['value'] });
      assert.false(controller.editModal);
    });

    test('editApiTags can handle comma separate string value', async function (assert) {
      await visit(urls.tags);
      const worker = await store.findRecord('worker', instances.worker.id);

      assert.deepEqual(worker.api_tags, apiTags);

      // set controller values needed for editing
      controller.modalTag = { key: 'test', value: 'test' };
      controller.editKey = 'unit';
      controller.editValue = 'test, are, fun';

      await controller.editApiTag();

      assert.deepEqual(worker.api_tags, {
        unit: ['test', 'are', 'fun'],
        key: ['value'],
      });
      assert.false(controller.editModal);
    });

    test('updateApiTags returns an update apiTags object with edited values added', async function (assert) {
      await visit(urls.tags);
      const worker = await store.findRecord('worker', instances.worker.id);

      assert.deepEqual(worker.api_tags, {
        key: ['value'],
        test: ['test'],
      });

      // set controller values needed for editing
      controller.modalTag = { key: 'test', value: 'test' };
      controller.editKey = 'unit';
      controller.editValue = 'test, are, fun';

      const result = controller.updateApiTags();

      assert.deepEqual(result, {
        key: ['value'],
        unit: ['test', 'are', 'fun'],
      });
    });

    test('toggleRemoveModal toggles the modal and sets the modalTag', function (assert) {
      assert.false(controller.removeModal);
      assert.strictEqual(controller.modalTag, null);

      controller.toggleRemoveModal({ key: 'test', value: 'test' });

      assert.true(controller.removeModal);
      assert.deepEqual(controller.modalTag, {
        key: 'test',
        value: 'test',
      });
    });

    test('toggleEditModal toggles the modal and sets the modalTag', function (assert) {
      assert.false(controller.editModal);
      assert.strictEqual(controller.modalTag, null);

      controller.toggleEditModal({ key: 'test', value: 'test' });

      assert.true(controller.editModal);
      assert.deepEqual(controller.modalTag, {
        key: 'test',
        value: 'test',
      });
    });
  },
);
