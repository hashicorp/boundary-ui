/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

module(
  'Unit | Controller | scopes/scope/workers/worker/tags',
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
    };

    hooks.beforeEach(function () {
      authenticateSession({});
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/workers/worker/tags',
      );

      instances.scopes.global = this.server.create('scope', { id: 'global' });
      instances.worker = this.server.create('worker', {
        scope: instances.scopes.global,
        api_tags: { test: ['test'], key: ['value'] },
      });
      urls.workers = `/scopes/global/workers`;
      urls.tags = `${urls.workers}/${instances.worker.id}/tags`;
    });

    test('it exists', function (assert) {
      assert.ok(controller);
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

    test('removeApiTag calls removeApiTags on the model and closes modal', async function (assert) {
      await visit(urls.tags);
      const worker = await store.findRecord('worker', instances.worker.id);
      const apiTagCount = worker.apiTagList.length;
      controller.modalTag = { key: 'test', value: 'test' };

      await controller.removeApiTag();

      assert.strictEqual(worker.apiTagList.length, apiTagCount - 1);
      assert.false(controller.removeModal);
      assert.strictEqual(controller.modalTag, null);
    });

    test('toggleRemoveModal toggles the modal and sets the apiTagToRemove', function (assert) {
      assert.false(controller.removeModal);
      assert.strictEqual(controller.modalTag, null);

      controller.toggleRemoveModal({ key: 'test', value: 'test' });

      assert.true(controller.removeModal);
      assert.deepEqual(controller.modalTag, {
        key: 'test',
        value: 'test',
      });
    });
  },
);
