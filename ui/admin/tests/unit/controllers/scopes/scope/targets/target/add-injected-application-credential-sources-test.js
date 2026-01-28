/**
 * Copyright IBM Corp. 2024, 2026
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
  TYPE_CREDENTIAL_SSH_PRIVATE_KEY,
  TYPE_CREDENTIAL_JSON,
} from 'api/models/credential';
import {
  TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
  TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
  TYPE_CREDENTIAL_LIBRARY_VAULT_LDAP,
} from 'api/models/credential-library';
import { TYPE_TARGET_SSH, TYPE_TARGET_RDP } from 'api/models/target';

module(
  'Unit | Controller | scopes/scope/targets/target/add-injected-application-credential-sources',
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
        'controller:scopes/scope/targets/target/add-injected-application-credential-sources',
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
      urls.addCredentialSources = `${urls.projectScope}/targets/${instances.target.id}/add-injected-application-credential-sources`;
      urls.credentialSources = `${urls.projectScope}/targets/${instances.target.id}/injected-application-credential-sources`;
    });

    test('it exists', function (assert) {
      assert.ok(controller);
    });

    test('hasAvailableInjectedApplicationCredentialSources returns true when compatible, unassigned sources exist for an SSH target', function (assert) {
      const target = store.createRecord('target', {
        injected_application_credential_source_ids: [],
        type: TYPE_TARGET_SSH,
      });
      const credentialLibraries = [
        store.createRecord('credential-library', {
          credential_type: TYPE_CREDENTIAL_USERNAME_PASSWORD,
        }),
      ];
      const credentials = [
        store.createRecord('credential', {
          type: TYPE_CREDENTIAL_USERNAME_PASSWORD,
        }),
      ];
      controller.set('model', { target, credentialLibraries, credentials });

      // Should be true as username_password is compatible with SSH
      assert.true(controller.hasAvailableInjectedApplicationCredentialSources);
    });

    test('hasAvailableInjectedApplicationCredentialSources returns false when only incompatible sources exist for an SSH target', function (assert) {
      const target = store.createRecord('target', {
        injected_application_credential_source_ids: [],
        type: TYPE_TARGET_SSH,
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

      // Should be false as username_password_domain is not compatible with SSH
      assert.false(controller.hasAvailableInjectedApplicationCredentialSources);
    });

    test('hasAvailableInjectedApplicationCredentialSources returns true when compatible sources exist for an RDP target', function (assert) {
      const target = store.createRecord('target', {
        injected_application_credential_source_ids: [],
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

      // Should be true as username_password_domain is compatible with RDP
      assert.true(controller.hasAvailableInjectedApplicationCredentialSources);
    });

    test('hasAvailableInjectedApplicationCredentialSources returns false when no compatible sources exist for an RDP target', function (assert) {
      const target = store.createRecord('target', {
        injected_application_credential_source_ids: [],
        type: TYPE_TARGET_RDP,
      });
      const credentialLibraries = [
        store.createRecord('credential-library', {
          credential_type: TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
        }),
      ];
      const credentials = [
        store.createRecord('credential', {
          type: TYPE_CREDENTIAL_JSON,
        }),
      ];
      controller.set('model', { target, credentialLibraries, credentials });

      // Should be false as SSH certificate and JSON are not compatible with RDP
      assert.false(controller.hasAvailableInjectedApplicationCredentialSources);
    });

    test.each(
      'filteredCredentialSources correctly filters sources based on target type',
      [
        {
          model: 'credential-library',
          type: TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
          credential_type: TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
          isInjectableForSSH: false,
          isInjectableForRDP: true,
        },
        {
          model: 'credential-library',
          type: TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
          credential_type: TYPE_CREDENTIAL_USERNAME_PASSWORD,
          isInjectableForSSH: true,
          isInjectableForRDP: true,
        },
        {
          model: 'credential',
          type: TYPE_CREDENTIAL_USERNAME_PASSWORD,
          credential_type: undefined,
          isInjectableForSSH: true,
          isInjectableForRDP: true,
        },
        {
          model: 'credential',
          type: TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
          credential_type: undefined,
          isInjectableForSSH: false,
          isInjectableForRDP: true,
        },
        {
          model: 'credential-library',
          type: TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
          credential_type: undefined,
          isInjectableForSSH: true,
          isInjectableForRDP: false,
        },
        {
          model: 'credential',
          type: TYPE_CREDENTIAL_SSH_PRIVATE_KEY,
          credential_type: undefined,
          isInjectableForSSH: true,
          isInjectableForRDP: false,
        },
        {
          model: 'credential',
          type: TYPE_CREDENTIAL_JSON,
          credential_type: undefined,
          isInjectableForSSH: false,
          isInjectableForRDP: false,
        },
        {
          model: 'credential-library',
          type: TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
          credential_type: TYPE_CREDENTIAL_SSH_PRIVATE_KEY,
          isInjectableForSSH: true,
          isInjectableForRDP: false,
        },
        {
          model: 'credential-library',
          type: TYPE_CREDENTIAL_LIBRARY_VAULT_LDAP,
          credential_type: TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
          isInjectableForSSH: false,
          isInjectableForRDP: true,
        },
      ],
      function (assert, input) {
        const record = store.createRecord(input.model, {
          type: input.type,
          credential_type: input.credential_type,
        });
        const sshTarget = store.createRecord('target', {
          type: TYPE_TARGET_SSH,
        });
        const rdpTarget = store.createRecord('target', {
          type: TYPE_TARGET_RDP,
        });

        const credentialLibraries =
          input.model === 'credential-library' ? [record] : [];
        const credentials = input.model === 'credential' ? [record] : [];

        // Test for SSH target
        controller.set('model', {
          target: sshTarget,
          credentialLibraries,
          credentials,
        });
        assert.strictEqual(
          controller.filteredCredentialSources.length === 1,
          input.isInjectableForSSH,
          `SSH target: Expected isInjectableForSSH to be ${input.isInjectableForSSH} for type ${input.type} and credential_type ${input.credential_type}`,
        );

        // Test for RDP target
        controller.set('model', {
          target: rdpTarget,
          credentialLibraries,
          credentials,
        });
        assert.strictEqual(
          controller.filteredCredentialSources.length === 1,
          input.isInjectableForRDP,
          `RDP target: Expected isInjectableForRDP to be ${input.isInjectableForRDP} for type ${input.type} and credential_type ${input.credential_type}`,
        );
      },
    );

    test('filteredCredentialSources excludes sources that are already injected', function (assert) {
      const credential = store.createRecord('credential', {
        id: 'cred_123',
        type: TYPE_CREDENTIAL_USERNAME_PASSWORD,
      });
      const target = store.createRecord('target', {
        injected_application_credential_source_ids: [{ value: 'cred_123' }],
        type: TYPE_TARGET_SSH,
      });

      controller.set('model', {
        target,
        credentialLibraries: [],
        credentials: [credential],
      });

      // The credential should be filtered out since it's already injected
      assert.strictEqual(controller.filteredCredentialSources.length, 0);
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

    test('cancel action causes transition to expected route', async function (assert) {
      await visit(urls.addCredentialSources);

      await controller.cancel();

      assert.strictEqual(currentURL(), urls.credentialSources);
    });
  },
);
