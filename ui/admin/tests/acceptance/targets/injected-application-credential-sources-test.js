/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { Response } from 'miragejs';
import { TYPE_TARGET_SSH, TYPE_TARGET_RDP } from 'api/models/target';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import {
  TYPE_CREDENTIAL_USERNAME_PASSWORD,
  TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
  TYPE_CREDENTIAL_JSON,
  TYPE_CREDENTIAL_PASSWORD,
} from 'api/models/credential';
import { setRunOptions } from 'ember-a11y-testing/test-support';

import {
  TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
  TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
  TYPE_CREDENTIAL_LIBRARY_VAULT_LDAP,
} from 'api/models/credential-library';

module(
  'Acceptance | targets | injected application credential sources',
  function (hooks) {
    setupApplicationTest(hooks);
    setupSqlite(hooks);

    let getCredentialLibraryCount;
    let getCredentialCount;
    let getCredentialForRDPCount;
    let getCredentialLibraryForRDPCount;
    let credentialSourceCount;
    let filteredCredentialLibraries;
    let filteredCredentials;
    let filteredCredentialLibrariesForRDP;
    let filteredCredentialsForRDP;
    let credentialSourceForRDPCount;

    const instances = {
      scopes: {
        org: null,
        project: null,
      },
      vaultCredentialStore: null,
      staticCredentialStore: null,
      credentialLibraries: null,
      credentialLibrary: null,
      credentials: null,
      credential: null,
    };
    const urls = {
      globalScope: null,
      orgScope: null,
      projectScope: null,
      targets: null,
      sshTarget: null,
      rdpTarget: null,
      credentialLibraries: null,
      credentialLibrary: null,
      addInjectedApplicationCredentialSourcesForSSHTarget: null,
      addInjectedApplicationCredentialSourcesForRDPTarget: null,
      injectedApplicationCredentialSourcesForSSHTarget: null,
      injectedApplicationCredentialSourcesForRDPTarget: null,
    };

    /**
     * Helper to select items from a collection based on a condition.
     */
    const selectItems = (collection, condition) =>
      collection.where(condition).models.map((item) => item.id);

    hooks.beforeEach(async function () {
      // Generate resources
      instances.scopes.org = this.server.create('scope', {
        type: 'org',
        scope: { id: 'global', type: 'global' },
      });
      instances.scopes.project = this.server.create('scope', {
        type: 'project',
        scope: { id: instances.scopes.org.id, type: 'org' },
      });
      instances.vaultCredentialStore = this.server.create('credential-store', {
        type: 'vault',
        scope: instances.scopes.project,
      });
      instances.staticCredentialStore = this.server.create('credential-store', {
        type: 'static',
        scope: instances.scopes.project,
      });
      instances.credentials = this.server.createList('credential', 6, {
        scope: instances.scopes.project,
        credentialStore: instances.staticCredentialStore,
      });
      instances.credentialLibraries = [
        ...this.server.createList('credential-library', 3, {
          scope: instances.scopes.project,
          credentialStore: instances.vaultCredentialStore,
          type: TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
        }),
        ...this.server.createList('credential-library', 3, {
          scope: instances.scopes.project,
          credentialStore: instances.vaultCredentialStore,
          type: TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
        }),
        ...this.server.createList('credential-library', 3, {
          scope: instances.scopes.project,
          credentialStore: instances.vaultCredentialStore,
          type: TYPE_CREDENTIAL_LIBRARY_VAULT_LDAP,
        }),
      ];
      instances.credentialLibrary = instances.credentialLibraries[0];
      instances.credential = instances.credentials[0];

      filteredCredentials = selectItems(
        this.server.schema.credentials,
        (cred) =>
          ![
            TYPE_CREDENTIAL_JSON,
            TYPE_CREDENTIAL_PASSWORD,
            TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
          ].includes(cred.type),
      );

      filteredCredentialLibraries = selectItems(
        this.server.schema.credentialLibraries,
        (cred) => {
          return (
            cred.credential_type !== TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN &&
            cred.credential_type !== TYPE_CREDENTIAL_PASSWORD &&
            cred.type !== TYPE_CREDENTIAL_LIBRARY_VAULT_LDAP
          );
        },
      );

      // credentials for RDP
      filteredCredentialLibrariesForRDP = selectItems(
        this.server.schema.credentialLibraries,
        (cred) =>
          [
            TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
            TYPE_CREDENTIAL_USERNAME_PASSWORD,
          ].includes(cred.credential_type) ||
          cred.type === TYPE_CREDENTIAL_LIBRARY_VAULT_LDAP,
      );
      filteredCredentialsForRDP = selectItems(
        this.server.schema.credentials,
        (cred) =>
          [
            TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
            TYPE_CREDENTIAL_USERNAME_PASSWORD,
          ].includes(cred.type),
      );

      instances.sshTarget = this.server.create('target', {
        scope: instances.scopes.project,
        type: TYPE_TARGET_SSH,
        injectedApplicationCredentialSourceIds: [
          ...filteredCredentials,
          ...filteredCredentialLibraries,
        ],
      });

      instances.rdpTarget = this.server.create('target', {
        scope: instances.scopes.project,
        type: TYPE_TARGET_RDP,
        injectedApplicationCredentialSourceIds: [
          ...filteredCredentialsForRDP,
          ...filteredCredentialLibrariesForRDP,
        ],
      });

      // Generate route URLs for resources
      urls.globalScope = `/scopes/global/scopes`;
      urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
      urls.projectScope = `/scopes/${instances.scopes.project.id}`;
      urls.targets = `${urls.projectScope}/targets`;
      urls.sshTarget = `${urls.targets}/${instances.sshTarget.id}`;
      urls.rdpTarget = `${urls.targets}/${instances.rdpTarget.id}`;
      urls.injectedApplicationCredentialSourcesForSSHTarget = `${urls.sshTarget}/injected-application-credential-sources`;
      urls.injectedApplicationCredentialSourcesForRDPTarget = `${urls.rdpTarget}/injected-application-credential-sources`;
      urls.credentialLibrary = `${urls.projectScope}/credential-stores/${instances.credentialLibrary.credentialStoreId}/credential-libraries/${instances.credentialLibrary.id}`;
      urls.credential = `${urls.projectScope}/credential-stores/${instances.credential.credentialStoreId}/credentials/${instances.credential.id}`;
      urls.addInjectedApplicationCredentialSourcesForSSHTarget = `${urls.sshTarget}/add-injected-application-credential-sources`;
      urls.addInjectedApplicationCredentialSourcesForRDPTarget = `${urls.rdpTarget}/add-injected-application-credential-sources`;

      // SSH specific credential sources
      getCredentialLibraryCount = () =>
        this.server.schema.credentialLibraries.where((c) => {
          return (
            c.credential_type !== TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN &&
            c.credential_type !== TYPE_CREDENTIAL_PASSWORD &&
            c.type !== TYPE_CREDENTIAL_LIBRARY_VAULT_LDAP
          );
        }).models.length;

      getCredentialCount = () =>
        this.server.schema.credentials.where(
          (cred) =>
            ![
              TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
              TYPE_CREDENTIAL_PASSWORD,
              TYPE_CREDENTIAL_JSON,
            ].includes(cred.type),
        ).models.length;

      // RDP specific credential sources
      getCredentialForRDPCount = () =>
        this.server.schema.credentials.where((cred) =>
          [
            TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
            TYPE_CREDENTIAL_USERNAME_PASSWORD,
          ].includes(cred.type),
        ).models.length;
      getCredentialLibraryForRDPCount = () =>
        this.server.schema.credentialLibraries.where(
          (cred) =>
            [
              TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
              TYPE_CREDENTIAL_USERNAME_PASSWORD,
            ].includes(cred.credential_type) ||
            cred.type === TYPE_CREDENTIAL_LIBRARY_VAULT_LDAP,
        ).models.length;

      credentialSourceCount =
        getCredentialLibraryCount() + getCredentialCount();

      credentialSourceForRDPCount =
        getCredentialLibraryForRDPCount() + getCredentialForRDPCount();
    });

    test.each(
      'visiting target injected application credential sources',
      {
        'for SSH target': {
          targetName: 'sshTarget',
          route: 'injectedApplicationCredentialSourcesForSSHTarget',
          expectedCount: () => credentialSourceCount,
        },
        'for RDP target': {
          targetName: 'rdpTarget',
          route: 'injectedApplicationCredentialSourcesForRDPTarget',
          expectedCount: () => credentialSourceForRDPCount,
        },
      },
      async function (assert, input) {
        setRunOptions({
          rules: {
            'color-contrast': {
              // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
              enabled: false,
            },
          },
        });
        const url = urls[input.route];
        const expectedCount = input.expectedCount();

        await visit(url);

        assert.strictEqual(currentURL(), url);
        assert
          .dom(commonSelectors.TABLE_ROWS)
          .isVisible({ count: expectedCount });
      },
    );

    test('can navigate to a vault type credential library', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

      await visit(urls.injectedApplicationCredentialSourcesForSSHTarget);

      await click(commonSelectors.TABLE_RESOURCE_LINK(urls.credentialLibrary));

      assert.strictEqual(currentURL(), urls.credentialLibrary);
    });

    test('can navigate to a username & password type credential', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

      instances.sshTarget.update({
        injectedApplicationCredentialSourceIds: [...filteredCredentials],
      });
      await visit(urls.injectedApplicationCredentialSourcesForSSHTarget);

      await click(commonSelectors.TABLE_RESOURCE_LINK(urls.credential));

      assert.strictEqual(currentURL(), urls.credential);
    });

    test.each(
      'displays the correct list of available credential sources to add',
      {
        'when all sources are available': {
          getInjectedIds: () => [],
          assertVisible: (assert) => {
            assert
              .dom(commonSelectors.TABLE_ROWS)
              .isVisible({ count: credentialSourceCount });
            assert.dom(commonSelectors.PAGE_MESSAGE_HEADER).doesNotExist();
          },
        },
        'when only credentials (not libraries) are available': {
          getInjectedIds: () => filteredCredentialLibraries,
          assertVisible: (assert) => {
            assert
              .dom(commonSelectors.TABLE_ROWS)
              .isVisible({ count: getCredentialCount() });
            assert.dom(commonSelectors.PAGE_MESSAGE_HEADER).doesNotExist();
          },
        },
        'when no sources are available': {
          getInjectedIds: () => [
            ...filteredCredentialLibraries,
            ...filteredCredentials,
          ],
          assertVisible: (assert) => {
            assert
              .dom(commonSelectors.PAGE_MESSAGE_HEADER)
              .hasText('No Injected Application Credential Sources Available');
            assert.dom(commonSelectors.TABLE_ROWS).doesNotExist();
          },
        },
      },
      async function (assert, input) {
        setRunOptions({
          rules: {
            'color-contrast': {
              // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
              enabled: false,
            },
          },
        });
        instances.sshTarget.update({
          injectedApplicationCredentialSourceIds: input.getInjectedIds(),
        });

        await visit(urls.addInjectedApplicationCredentialSourcesForSSHTarget);

        input.assertVisible(assert);
      },
    );

    test('when no injected application credential sources available, button routes to add injected application credential sources', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

      instances.sshTarget.update({
        injectedApplicationCredentialSourceIds: [],
      });
      await visit(urls.injectedApplicationCredentialSourcesForSSHTarget);

      // Click on the rose message link
      await click(commonSelectors.PAGE_MESSAGE_LINK);

      assert.strictEqual(
        currentURL(),
        urls.addInjectedApplicationCredentialSourcesForSSHTarget,
      );
    });

    test.each(
      'can select credential sources for SSH target',
      {
        'save vault generic credential-library': {
          credentialSources: [TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC],
          action: commonSelectors.SAVE_BTN,
          expectedCount: 1,
        },
        'save username and password credential': {
          credentialSources: [TYPE_CREDENTIAL_USERNAME_PASSWORD],
          action: commonSelectors.SAVE_BTN,
          expectedCount: 1,
        },
        'save credentials and credential-libraries': {
          credentialSources: [
            TYPE_CREDENTIAL_USERNAME_PASSWORD,
            TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
          ],
          action: commonSelectors.SAVE_BTN,
          expectedCount: 2,
        },
        'cancel vault generic credential-library': {
          credentialSources: [TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC],
          action: commonSelectors.CANCEL_BTN,
          expectedCount: 0,
        },
        'cancel username and password credential': {
          credentialSources: [TYPE_CREDENTIAL_USERNAME_PASSWORD],
          action: commonSelectors.CANCEL_BTN,
          expectedCount: 0,
        },
        'cancel credentials and credential-libraries': {
          credentialSources: [
            TYPE_CREDENTIAL_USERNAME_PASSWORD,
            TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
          ],
          action: commonSelectors.CANCEL_BTN,
          expectedCount: 0,
        },
      },
      async function (assert, input) {
        setRunOptions({
          rules: {
            'color-contrast': {
              // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-04
              enabled: false,
            },
          },
        });

        instances.sshTarget.update({
          injectedApplicationCredentialSourceIds: [],
        });
        await visit(urls.injectedApplicationCredentialSourcesForSSHTarget);

        assert.dom(commonSelectors.TABLE_ROWS).isVisible({ count: 0 });

        await click(selectors.MANAGE_DROPDOWN);
        await click(selectors.MANGE_DROPDOWN_ADD_INJECTED_CREDENTIALS);

        assert.strictEqual(
          currentURL(),
          urls.addInjectedApplicationCredentialSourcesForSSHTarget,
        );

        assert
          .dom(commonSelectors.TABLE_ROWS)
          .isVisible({ count: credentialSourceCount });

        for (const type of input.credentialSources) {
          await click(selectors.TABLE_CREDENTIAL_SOURCE_CHECKBOX(type));
        }
        await click(input.action);

        assert.strictEqual(
          currentURL(),
          urls.injectedApplicationCredentialSourcesForSSHTarget,
        );

        assert
          .dom(commonSelectors.TABLE_ROWS)
          .isVisible({ count: input.expectedCount });
      },
    );

    test.each(
      'can select credential sources for RDP target',
      {
        'save username and password credential': {
          credentialSources: [TYPE_CREDENTIAL_USERNAME_PASSWORD],
          action: commonSelectors.SAVE_BTN,
          expectedCount: 1,
        },
        'save username, password & domain credential': {
          credentialSources: [TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN],
          action: commonSelectors.SAVE_BTN,
          expectedCount: 1,
        },
        'save credentials and credential-libraries': {
          credentialSources: [
            TYPE_CREDENTIAL_USERNAME_PASSWORD,
            TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
            TYPE_CREDENTIAL_LIBRARY_VAULT_LDAP,
          ],
          action: commonSelectors.SAVE_BTN,
          expectedCount: 3,
        },

        'cancel vault generic credential-library': {
          credentialSources: [TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC],
          action: commonSelectors.CANCEL_BTN,
          expectedCount: 0,
        },
        'cancel username and password credential': {
          credentialSources: [TYPE_CREDENTIAL_USERNAME_PASSWORD],
          action: commonSelectors.CANCEL_BTN,
          expectedCount: 0,
        },
        'cancel vault ldap credential': {
          credentialSources: [TYPE_CREDENTIAL_LIBRARY_VAULT_LDAP],
          action: commonSelectors.CANCEL_BTN,
          expectedCount: 0,
        },
        'cancel username, password & domain credential': {
          credentialSources: [TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN],
          action: commonSelectors.CANCEL_BTN,
          expectedCount: 0,
        },
        'cancel credentials and credential-libraries': {
          credentialSources: [
            TYPE_CREDENTIAL_USERNAME_PASSWORD,
            TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
            TYPE_CREDENTIAL_LIBRARY_VAULT_LDAP,
          ],
          action: commonSelectors.CANCEL_BTN,
          expectedCount: 0,
        },
      },
      async function (assert, input) {
        setRunOptions({
          rules: {
            'color-contrast': {
              // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
              enabled: false,
            },
          },
        });
        instances.rdpTarget.update({
          injectedApplicationCredentialSourceIds: [],
        });
        await visit(urls.injectedApplicationCredentialSourcesForRDPTarget);

        assert.dom(commonSelectors.TABLE_ROWS).isVisible({ count: 0 });

        await click(selectors.MANAGE_DROPDOWN);
        await click(selectors.MANGE_DROPDOWN_ADD_INJECTED_CREDENTIALS);

        assert.strictEqual(
          currentURL(),
          urls.addInjectedApplicationCredentialSourcesForRDPTarget,
        );
        assert
          .dom(commonSelectors.TABLE_ROWS)
          .isVisible({ count: credentialSourceForRDPCount });
        for (const type of input.credentialSources) {
          await click(selectors.TABLE_CREDENTIAL_SOURCE_CHECKBOX(type));
        }
        await click(input.action);

        assert.strictEqual(
          currentURL(),
          urls.injectedApplicationCredentialSourcesForRDPTarget,
        );
        assert
          .dom(commonSelectors.TABLE_ROWS)
          .isVisible({ count: input.expectedCount });
      },
    );

    test.each(
      'cannot add credential sources without proper authorization',
      {
        'for SSH target': {
          targetName: 'sshTarget',
          route: 'injectedApplicationCredentialSourcesForSSHTarget',
        },
        'for RDP target': {
          targetName: 'rdpTarget',
          route: 'injectedApplicationCredentialSourcesForRDPTarget',
        },
      },
      async function (assert, input) {
        setRunOptions({
          rules: {
            'color-contrast': {
              // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
              enabled: false,
            },
          },
        });
        const target = instances[input.targetName];
        const url = urls[input.route];

        target.authorized_actions = target.authorized_actions.filter(
          (item) => item !== 'add-credential-sources',
        );
        await visit(url);

        await click(selectors.MANAGE_DROPDOWN);

        assert
          .dom(selectors.MANGE_DROPDOWN_ADD_INJECTED_CREDENTIALS)
          .doesNotExist();
      },
    );

    test('adding credential sources which errors displays error message', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

      this.server.post('/targets/:idMethod', () => {
        return new Response(
          400,
          {},
          {
            status: 400,
            code: 'invalid_argument',
            message: 'The request was invalid.',
            details: {},
          },
        );
      });
      instances.sshTarget.update({
        injectedApplicationCredentialSourceIds: [],
      });
      await visit(urls.addInjectedApplicationCredentialSourcesForSSHTarget);

      await click(
        selectors.TABLE_CREDENTIAL_SOURCE_CHECKBOX(
          TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
        ),
      );
      await click(
        selectors.TABLE_CREDENTIAL_SOURCE_CHECKBOX(
          TYPE_CREDENTIAL_USERNAME_PASSWORD,
        ),
      );
      await click(commonSelectors.SAVE_BTN);

      assert.dom(commonSelectors.ALERT_TOAST_BODY).isVisible();
    });

    test.each(
      'can remove an injected application credential source',
      {
        'for a credential library': {
          getCredentialSourceIds: () => filteredCredentialLibraries,
          getCount: () => getCredentialLibraryCount(),
        },
        'for a credential': {
          getCredentialSourceIds: () => filteredCredentials,
          getCount: () => getCredentialCount(),
        },
      },
      async function (assert, input) {
        setRunOptions({
          rules: {
            'color-contrast': {
              // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
              enabled: false,
            },
          },
        });

        const credentialSourceIds = input.getCredentialSourceIds();
        const count = input.getCount();

        instances.sshTarget.update({
          injectedApplicationCredentialSourceIds: credentialSourceIds,
        });

        await visit(urls.injectedApplicationCredentialSourcesForSSHTarget);

        assert.dom(commonSelectors.TABLE_ROWS).isVisible({ count });

        await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN);
        await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN_ITEM_BTN);

        assert.dom(commonSelectors.TABLE_ROWS).isVisible({ count: count - 1 });
      },
    );

    test.each(
      'cannot remove credential sources without proper authorization',
      {
        'for SSH target': {
          targetName: 'sshTarget',
          route: 'injectedApplicationCredentialSourcesForSSHTarget',
        },
        'for RDP target': {
          targetName: 'rdpTarget',
          route: 'injectedApplicationCredentialSourcesForRDPTarget',
        },
      },
      async function (assert, input) {
        setRunOptions({
          rules: {
            'color-contrast': {
              // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
              enabled: false,
            },
          },
        });

        const target = instances[input.targetName];
        const url = urls[input.route];

        target.authorized_actions = target.authorized_actions.filter(
          (item) => item !== 'remove-credential-sources',
        );
        await visit(url);

        assert
          .dom(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN)
          .doesNotExist();
      },
    );

    test.each(
      'removing a target credential source which errors displays an error message',
      {
        'for a credential library': {
          getCredentialSourceIds: () => filteredCredentialLibraries,
          getCount: () => getCredentialLibraryCount(),
        },
        'for a credential': {
          getCredentialSourceIds: () => filteredCredentials,
          getCount: () => getCredentialCount(),
        },
      },
      async function (assert, input) {
        setRunOptions({
          rules: {
            'color-contrast': {
              // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
              enabled: false,
            },
          },
        });

        const credentialSourceIds = input.getCredentialSourceIds();
        const count = input.getCount();

        instances.sshTarget.update({
          injectedApplicationCredentialSourceIds: credentialSourceIds,
        });

        this.server.post('/targets/:idMethod', () => {
          return new Response(
            400,
            {},
            {
              error: 'The request was invalid.',
            },
          );
        });

        await visit(urls.injectedApplicationCredentialSourcesForSSHTarget);

        assert.dom(commonSelectors.TABLE_ROWS).isVisible({ count });

        await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN);
        await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN_ITEM_BTN);

        assert.dom(commonSelectors.ALERT_TOAST_BODY).isVisible();
        assert.dom(commonSelectors.TABLE_ROWS).isVisible({ count });
      },
    );
  },
);
