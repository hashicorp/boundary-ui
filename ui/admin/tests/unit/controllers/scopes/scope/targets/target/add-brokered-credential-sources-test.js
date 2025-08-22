/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { currentURL, visit } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { authenticateSession } from 'ember-simple-auth/test-support';

module(
  'Unit | Controller | scopes/scope/targets/target/add-brokered-credential-sources',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);
    setupSqlite(hooks);

    let store;
    let controller;

    const instances = {
      scopes: {
        global: null,
        org: null,
        project: null,
      },
      target: null,
      credential: null,
    };

    const urls = {
      projectScope: null,
      addCredentialSources: null,
      credentialSources: null,
    };

    hooks.beforeEach(async function () {
      await authenticateSession({});
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/targets/target/add-brokered-credential-sources',
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
      instances.credential = this.server.create('credential', {
        scope: instances.scopes.project,
      });

      urls.projectScope = `/scopes/${instances.scopes.project.id}`;
      urls.addCredentialSources = `${urls.projectScope}/targets/${instances.target.id}/add-brokered-credential-sources`;
      urls.credentialSources = `${urls.projectScope}/targets/${instances.target.id}/brokered-credential-sources`;
    });

    test('it exists', function (assert) {
      assert.ok(controller);
    });

    test('hasAvailableBrokeredCredentialSources returns true if target has available credentials', function (assert) {
      const target = store.createRecord('target', {
        brokered_credential_source_ids: [{ value: 'cred_123' }],
      });
      const credentialLibraries = [
        store.createRecord('credential-library', {}),
      ];
      const credentials = [store.createRecord('credential', {})];
      controller.set('model', { target, credentialLibraries, credentials });

      assert.true(controller.hasAvailableBrokeredCredentialSources);
    });

    test('hasAvailableBrokeredCredentialSources returns false if target has no available credentials', function (assert) {
      const target = store.createRecord('target', {
        brokered_credential_source_ids: [{ value: 'cred_123' }],
      });
      controller.set('model', {
        target,
        credentialLibraries: [],
        credentials: [],
      });

      assert.false(controller.hasAvailableBrokeredCredentialSources);
    });

    test('save action saves credential sources on the specified model', async function (assert) {
      await visit(urls.addCredentialSources);
      const target = await store.findRecord('target', instances.target.id);

      assert.deepEqual(target.brokered_credential_source_ids, []);

      await controller.save(target, [instances.credential.id]);

      assert.deepEqual(target.brokered_credential_source_ids, [
        { value: instances.credential.id },
      ]);
    });

    test('cancel action causes transition to expected route', async function (assert) {
      await visit(urls.addCredentialSources);

      await controller.cancel();

      assert.strictEqual(currentURL(), urls.credentialSources);
    });
  },
);
