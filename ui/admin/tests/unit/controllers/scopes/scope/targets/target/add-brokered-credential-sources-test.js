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
import {
  TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
  TYPE_CREDENTIAL_USERNAME_PASSWORD,
} from 'api/models/credential';
import {
  TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
  TYPE_CREDENTIAL_LIBRARY_VAULT_LDAP,
} from 'api/models/credential-library';
import { TYPE_TARGET_RDP } from 'api/models/target';

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
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/targets/target/add-brokered-credential-sources',
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

    test('hasAvailableBrokeredCredentialSources returns true if target has available credentials for RDP target', function (assert) {
      const target = store.createRecord('target', {
        brokered_credential_source_ids: [{ value: 'cred_123' }],
        type: TYPE_TARGET_RDP,
      });
      const credentialLibraries = [
        store.createRecord('credential-library', {
          credential_type: TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
        }),
      ];
      const credentials = [
        store.createRecord('credential', {
          type: TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
        }),
      ];
      controller.set('model', { target, credentialLibraries, credentials });

      assert.true(controller.hasAvailableBrokeredCredentialSources);
    });

    test('hasAvailableBrokeredCredentialSources returns false if target has no available credentials for RDP target', function (assert) {
      const target = store.createRecord('target', {
        brokered_credential_source_ids: [{ value: 'cred_123' }],
        type: TYPE_TARGET_RDP,
      });
      controller.set('model', {
        target,
        credentialLibraries: [],
        credentials: [],
      });

      assert.false(controller.hasAvailableBrokeredCredentialSources);
    });

    test('filteredCredentialSources returns credential libraries and credentials not already added to RDP target', function (assert) {
      const credential1 = store.createRecord('credential', {
        id: 'cred_1',
        type: TYPE_CREDENTIAL_USERNAME_PASSWORD,
      });
      const credential2 = store.createRecord('credential', {
        id: 'cred_2',
        type: TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
      });

      const credentialLibrary1 = store.createRecord('credential-library', {
        id: 'lib_1',
        type: TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
        credential_type: TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
      });
      const credentialLibrary2 = store.createRecord('credential-library', {
        id: 'lib_2',
        type: TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
        credential_type: TYPE_CREDENTIAL_USERNAME_PASSWORD,
      });
      const credentialLibrary3 = store.createRecord('credential-library', {
        id: 'lib_3',
        type: TYPE_CREDENTIAL_LIBRARY_VAULT_LDAP,
        credential_type: TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
      });

      const target = store.createRecord('target', {
        brokered_credential_source_ids: [{ value: 'cred_2' }],
        type: TYPE_TARGET_RDP,
      });

      controller.set('model', {
        target,
        credentialLibraries: [
          credentialLibrary1,
          credentialLibrary2,
          credentialLibrary3,
        ],
        credentials: [credential1],
      });

      const filteredCredentialSources = controller.filteredCredentialSources;
      assert.strictEqual(filteredCredentialSources.length, 4);
      assert.true(filteredCredentialSources.includes(credentialLibrary1));
      assert.true(filteredCredentialSources.includes(credentialLibrary2));
      assert.true(filteredCredentialSources.includes(credentialLibrary3));
      assert.true(filteredCredentialSources.includes(credential1));
      assert.false(filteredCredentialSources.includes(credential2));
    });
  },
);
