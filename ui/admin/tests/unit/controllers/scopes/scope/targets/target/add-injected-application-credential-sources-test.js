/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

module(
  'Unit | Controller | scopes/scope/targets/target/add-injected-application-credential-sources',
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
      credential: null,
    };

    const urls = {
      projectScope: null,
      addCredentialSources: null,
    };

    hooks.beforeEach(function () {
      authenticateSession({});
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/targets/target/add-injected-application-credential-sources',
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
      urls.addCredentialSources = `${urls.projectScope}/targets/${instances.target.id}/add-injected-application-credential-sources`;
    });

    test('it exists', function (assert) {
      assert.ok(controller);
    });

    test('hasAvailableInjectedApplicationCredentialSources returns true if target has available credentials', function (assert) {
      const target = store.createRecord('target', {
        injected_application_credential_source_ids: [{ value: 'cred_123' }],
      });
      const credentialLibraries = [
        store.createRecord('credential-library', {}),
      ];
      const credentials = [store.createRecord('credential', {})];
      controller.set('model', { target, credentialLibraries, credentials });

      assert.true(controller.hasAvailableInjectedApplicationCredentialSources);
    });

    test('hasAvailableInjectedApplicationCredentialSources returns false if target has no available credentials', function (assert) {
      const target = store.createRecord('target', {
        injected_application_credential_source_ids: [{ value: 'cred_123' }],
      });
      controller.set('model', {
        target,
        credentialLibraries: [],
        credentials: [],
      });

      assert.false(controller.hasAvailableInjectedApplicationCredentialSources);
    });

    test('save action saves credential sources on the specified model', async function (assert) {
      await visit(urls.addCredentialSources);
      const target = await store.findRecord('target', instances.target.id);

      assert.deepEqual(target.injected_application_credential_source_ids, []);

      await controller.save(target, [instances.credential.id]);

      assert.deepEqual(target.injected_application_credential_source_ids, [
        { value: instances.credential.id },
      ]);
    });
  },
);
