/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import { setupMirage } from 'api/test-support/helpers/mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { authenticateSession } from 'ember-simple-auth/test-support';

module(
  'Unit | Controller | scopes/scope/targets/target/enable-session-recording/index',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);
    setupSqlite(hooks);

    let store;
    let controller;

    const instances = {
      scopes: {
        org: null,
        project: null,
      },
      target: null,
    };

    const urls = {
      projectScope: null,
      enableSessionRecording: null,
    };

    hooks.beforeEach(async function () {
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/targets/target/enable-session-recording/index',
      );

      this.server.create('scope', { id: 'global' }, 'withGlobalAuth');
      await authenticateSession({
        isGlobal: true,
        account_id: this.server.schema.accounts.first().id,
      });
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
      assert.ok(controller.targets);
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
