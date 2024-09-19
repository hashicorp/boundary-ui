/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { waitUntil } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module(
  'Unit | Controller | scopes/scope/session-recordings/index',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);

    let controller;

    const instances = {
      scopes: {
        global: null,
      },
      sessionRecording: null,
      storageBucket: null,
    };

    hooks.beforeEach(function () {
      controller = this.owner.lookup(
        'controller:scopes/scope/session-recordings/index',
      );

      instances.scopes.global = this.server.create('scope', { id: 'global' });
      instances.sessionRecording = this.server.create('session-recording', {
        scope: instances.scopes.global,
      });
      instances.storageBucket = this.server.create('storage-bucket', {
        scope: instances.scopes.global,
      });
    });

    test('it exists', function (assert) {
      assert.ok(controller);
    });

    test('handleSearchInput action sets expected values correctly', async function (assert) {
      const searchValue = 'test';
      controller.handleSearchInput({ target: { value: searchValue } });
      await waitUntil(() => controller.search === searchValue);

      assert.strictEqual(controller.page, 1);
      assert.strictEqual(controller.search, searchValue);
    });
  },
);
