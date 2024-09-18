/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
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

    test('hasSessionRecordings returns true if session recordings exist', function (assert) {
      controller.set('model', {
        sessionRecordings: [instances.sessionRecording],
      });
      assert.true(controller.hasSessionRecordings);
    });

    test('hasSessionRecordings returns false if no session recordings exist', function (assert) {
      controller.set('model', { sessionRecordings: [] });
      assert.false(controller.hasSessionRecordings);
    });

    test('hasSessionRecordingsConfigured returns true if storage buckets exist', function (assert) {
      controller.set('model', { storageBuckets: [instances.storageBucket] });
      assert.true(controller.hasSessionRecordingsConfigured);
    });

    test('hasSessionRecordingsConfigured returns false if no storage buckets exist', function (assert) {
      controller.set('model', { storageBuckets: [] });
      assert.false(controller.hasSessionRecordingsConfigured);
    });
  },
);
