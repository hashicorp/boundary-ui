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
  'Unit | Controller | scopes/scope/targets/target/enable-session-recording/index',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);

    let store;
    let controller;

    const instances = {
      scopes: {
        global: null,
        org: null,
        project: null,
      },
      target: null,
    };

    const urls = {
      projectScope: null,
      enableSessionRecording: null,
    };

    hooks.beforeEach(function () {
      authenticateSession({});
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/targets/target/enable-session-recording/index',
      );

      instances.scopes.global = this.server.create('scope', { id: 'global' });
      instances.scopes.org = this.server.create('scope', {
        type: 'org',
        scope: { id: 'global', type: 'global' },
      });
      instances.scopes.project = this.server.create('scope', {
        type: 'project',
        scope: { id: instances.scopes.org.id, type: 'org' },
      });
      instances.target = this.server.create('target', {
        scope: instances.scopes.project,
      });

      urls.projectScope = `/scopes/${instances.scopes.project.id}`;
      urls.enableSessionRecording = `${urls.projectScope}/targets/${instances.target.id}/enable-session-recording`;
    });

    test('it exists', function (assert) {
      assert.ok(controller);
    });

    test('cancel action rolls-back changes on the specified model', async function (assert) {
      await visit(urls.enableSessionRecording);
      const target = await store.findRecord('target', instances.target.id);
      target.enable_session_recording = 'true';

      assert.strictEqual(target.enable_session_recording, 'true');

      await controller.cancel(target);

      assert.notEqual(target.enable_session_recording, 'true');
    });
  },
);
