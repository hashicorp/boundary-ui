/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';
import {
  TYPE_CREDENTIAL_USERNAME_PASSWORD,
  TYPE_CREDENTIAL_SSH_PRIVATE_KEY,
  TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
  TYPE_CREDENTIAL_JSON,
} from 'api/models/credential';
import {
  TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
  TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
} from 'api/models/credential-library';
import { TYPE_TARGET_RDP, TYPE_TARGET_TCP } from 'api/models/target';

module('Acceptance | targets | brokered credential sources', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupSqlite(hooks);

  let getCredentialLibraryCount;
  let getCredentialCount;
  let credentialSourceCount;
  let randomlySelectedCredentialLibraries;
  let randomlySelectedCredentials;
  let featuresService;

  const instances = {
    scopes: {
      global: null,
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
    tcpTarget: null,
    rdpTarget: null,
    credentialLibraries: null,
    credentialLibrary: null,
    credential: null,
    jsonCredential: null,
    addBrokeredCredentialSourcesForTCPTarget: null,
    brokeredCredentialSourcesForTCPTarget: null,
    addBrokeredCredentialSourcesForRDPTarget: null,
    brokeredCredentialSourcesForRDPTarget: null,
  };

  hooks.beforeEach(async function () {
    featuresService = this.owner.lookup('service:features');
    // Generate resources
    instances.scopes.global = this.server.create('scope', { id: 'global' });
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
    instances.credentials = this.server.createList('credential', 4, {
      scope: instances.scopes.project,
      credentialStore: instances.staticCredentialStore,
    });
    instances.credentialLibraries = this.server.createList(
      'credential-library',
      2,
      {
        scope: instances.scopes.project,
        credentialStore: instances.vaultCredentialStore,
      },
    );
    instances.credentialLibrary = instances.credentialLibraries[0];
    instances.credential = instances.credentials[0];

    randomlySelectedCredentials = this.server.schema.credentials
      .all()
      .models.map((cred) => cred.id);
    randomlySelectedCredentialLibraries = this.server.schema.credentialLibraries
      .all()
      .models.map((cred) => cred.id);

    instances.tcpTarget = this.server.create('target', {
      scope: instances.scopes.project,
      type: TYPE_TARGET_TCP,
      brokeredCredentialSourceIds: [
        ...randomlySelectedCredentialLibraries,
        ...randomlySelectedCredentials,
      ],
    });

    instances.rdpTarget = this.server.create('target', {
      scope: instances.scopes.project,
      type: TYPE_TARGET_RDP,
      brokeredCredentialSourceIds: [
        ...randomlySelectedCredentialLibraries,
        ...randomlySelectedCredentials,
      ],
    });

    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.targets = `${urls.projectScope}/targets`;
    urls.tcpTarget = `${urls.targets}/${instances.tcpTarget.id}`;
    urls.rdpTarget = `${urls.targets}/${instances.rdpTarget.id}`;
    urls.brokeredCredentialSourcesForTCPTarget = `${urls.tcpTarget}/brokered-credential-sources`;
    urls.brokeredCredentialSourcesForRDPTarget = `${urls.rdpTarget}/brokered-credential-sources`;
    urls.credentialLibrary = `${urls.projectScope}/credential-stores/${instances.credentialLibrary.credentialStoreId}/credential-libraries/${instances.credentialLibrary.id}`;
    urls.credential = `${urls.projectScope}/credential-stores/${instances.credential.credentialStoreId}/credentials/${instances.credential.id}`;
    urls.jsonCredential = `${urls.projectScope}/credential-stores/${instances.credentials[3].credentialStoreId}/credentials/${instances.credentials[3].id}`;
    urls.addBrokeredCredentialSourcesForTCPTarget = `${urls.tcpTarget}/add-brokered-credential-sources`;
    urls.addBrokeredCredentialSourcesForRDPTarget = `${urls.rdpTarget}/add-brokered-credential-sources`;
    getCredentialLibraryCount = () =>
      this.server.schema.credentialLibraries.all().models.length;
    getCredentialCount = () =>
      this.server.schema.credentials.all().models.length;
    credentialSourceCount = getCredentialLibraryCount() + getCredentialCount();

    await authenticateSession({ username: 'admin' });
  });

  test.each(
    'visiting brokered credential sources',
    {
      'for TCP target': {
        route: 'brokeredCredentialSourcesForTCPTarget',
      },
      'for RDP target': {
        route: 'brokeredCredentialSourcesForRDPTarget',
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

      await visit(urls[input.route]);

      assert.strictEqual(currentURL(), urls[input.route]);
      assert
        .dom(commonSelectors.TABLE_ROWS)
        .isVisible({ count: credentialSourceCount });
    },
  );

  test.each(
    'can navigate to a credential library and credential',
    {
      'username & password credential type for TCP target': {
        route: 'brokeredCredentialSourcesForTCPTarget',
        targetName: 'tcpTarget',
        link: 'credential',
        expectedUrl: 'credential',
      },

      'username & password credential type for RDP target': {
        route: 'brokeredCredentialSourcesForRDPTarget',
        targetName: 'rdpTarget',
        link: 'credential',
        expectedUrl: 'credential',
      },
      'vault generic credential library type for TCP target': {
        route: 'brokeredCredentialSourcesForTCPTarget',
        targetName: 'tcpTarget',
        link: 'credentialLibrary',
        expectedUrl: 'credentialLibrary',
      },
      'vault generic credential library type for RDP target': {
        route: 'brokeredCredentialSourcesForRDPTarget',
        targetName: 'rdpTarget',
        link: 'credentialLibrary',
        expectedUrl: 'credentialLibrary',
      },
      'json credential type for TCP target': {
        route: 'brokeredCredentialSourcesForTCPTarget',
        targetName: 'tcpTarget',
        link: 'jsonCredential',
        expectedUrl: 'jsonCredential',
        enableJsonFeature: true,
      },
      'json credential type for RDP target': {
        route: 'brokeredCredentialSourcesForRDPTarget',
        targetName: 'rdpTarget',
        link: 'jsonCredential',
        expectedUrl: 'jsonCredential',
        enableJsonFeature: true,
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

      // needed only if the test is for json credential
      if (input.enableJsonFeature) {
        featuresService.enable('json-credentials');
      }
      await visit(urls[input.route]);

      await click(commonSelectors.TABLE_RESOURCE_LINK(urls[input.link]));

      assert.strictEqual(currentURL(), urls[input.expectedUrl]);
    },
  );

  test.each(
    'cannot navigate to a json type credential when feature is disabled',
    {
      'for TCP target': {
        route: 'brokeredCredentialSourcesForTCPTarget',
        targetName: 'tcpTarget',
      },
      'for RDP target': {
        route: 'brokeredCredentialSourcesForRDPTarget',
        targetName: 'rdpTarget',
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

      const jsonCredential = instances.credentials[3];
      instances[input.targetName].update({
        brokeredCredentialSourceIds: [...randomlySelectedCredentials],
      });
      await visit(urls[input.route]);

      assert.false(featuresService.isEnabled('json-credentials'));
      assert
        .dom(commonSelectors.TABLE_ROW(4))
        .includesText(jsonCredential.name);
      assert.dom(commonSelectors.HREF(urls.jsonCredential)).doesNotExist();
    },
  );

  test.each(
    'visiting add brokered credential sources',
    {
      'for TCP target': {
        route: 'addBrokeredCredentialSourcesForTCPTarget',
      },
      'for RDP target': {
        route: 'addBrokeredCredentialSourcesForRDPTarget',
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

      await visit(urls[input.route]);

      assert.strictEqual(currentURL(), urls[input.route]);
    },
  );

  test.each(
    'displays correct list of brokered credential sources for TCP target to add',
    {
      'all credential source types are available': {
        getBrokeredCredentialSourceIds: () => [],
        assertVisible: (assert) => {
          assert
            .dom(commonSelectors.TABLE_ROWS)
            .isVisible({ count: credentialSourceCount });
          assert.dom(commonSelectors.PAGE_MESSAGE_HEADER).doesNotExist();
        },
      },
      'only credential libraries are available': {
        getBrokeredCredentialSourceIds: () => randomlySelectedCredentials,
        assertVisible: (assert) => {
          assert
            .dom(commonSelectors.TABLE_ROWS)
            .isVisible({ count: getCredentialLibraryCount() });
          assert.dom(commonSelectors.PAGE_MESSAGE_HEADER).doesNotExist();
        },
      },
      'only credentials are available': {
        getBrokeredCredentialSourceIds: () =>
          randomlySelectedCredentialLibraries,
        assertVisible: (assert) => {
          assert
            .dom(commonSelectors.TABLE_ROWS)
            .isVisible({ count: getCredentialCount() });
          assert.dom(commonSelectors.PAGE_MESSAGE_HEADER).doesNotExist();
        },
      },
      'no brokered credential sources are available': {
        getBrokeredCredentialSourceIds: () => [
          ...randomlySelectedCredentialLibraries,
          ...randomlySelectedCredentials,
        ],
        assertVisible: (assert) => {
          assert
            .dom(commonSelectors.PAGE_MESSAGE_HEADER)
            .hasText('No Brokered Credential Sources Available');
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

      instances.tcpTarget.update({
        brokeredCredentialSourceIds: input.getBrokeredCredentialSourceIds(),
      });
      await visit(urls.addBrokeredCredentialSourcesForTCPTarget);

      input.assertVisible(assert);
    },
  );

  test.each(
    'displays correct list of brokered credential sources for RDP target to add',
    {
      'all credential source types are available': {
        getBrokeredCredentialSourceIds: () => [],
        assertVisible: (assert) => {
          assert
            .dom(commonSelectors.TABLE_ROWS)
            .isVisible({ count: credentialSourceCount });
          assert.dom(commonSelectors.PAGE_MESSAGE_HEADER).doesNotExist();
        },
      },
      'only credential libraries are available': {
        getBrokeredCredentialSourceIds: () => randomlySelectedCredentials,
        assertVisible: (assert) => {
          assert
            .dom(commonSelectors.TABLE_ROWS)
            .isVisible({ count: getCredentialLibraryCount() });
          assert.dom(commonSelectors.PAGE_MESSAGE_HEADER).doesNotExist();
        },
      },
      'only credentials are available': {
        getBrokeredCredentialSourceIds: () =>
          randomlySelectedCredentialLibraries,
        assertVisible: (assert) => {
          assert
            .dom(commonSelectors.TABLE_ROWS)
            .isVisible({ count: getCredentialCount() });
          assert.dom(commonSelectors.PAGE_MESSAGE_HEADER).doesNotExist();
        },
      },
      'no brokered credential sources are available': {
        getBrokeredCredentialSourceIds: () => [
          ...randomlySelectedCredentialLibraries,
          ...randomlySelectedCredentials,
        ],
        assertVisible: (assert) => {
          assert
            .dom(commonSelectors.PAGE_MESSAGE_HEADER)
            .hasText('No Brokered Credential Sources Available');
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

      instances.rdpTarget.update({
        brokeredCredentialSourceIds: input.getBrokeredCredentialSourceIds(),
      });
      await visit(urls.addBrokeredCredentialSourcesForRDPTarget);

      input.assertVisible(assert);
    },
  );

  test.each(
    'when no brokered credential sources available, button routes to add brokered credential sources',
    {
      'for TCP target': {
        route: 'brokeredCredentialSourcesForTCPTarget',
        addRoute: 'addBrokeredCredentialSourcesForTCPTarget',
        targetName: 'tcpTarget',
      },
      'for RDP target': {
        route: 'brokeredCredentialSourcesForRDPTarget',
        addRoute: 'addBrokeredCredentialSourcesForRDPTarget',
        targetName: 'rdpTarget',
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
      instances[input.targetName].update({
        brokeredCredentialSourceIds: [],
      });
      await visit(urls[input.route]);

      // Click on the rose message link
      await click(commonSelectors.PAGE_MESSAGE_LINK);

      assert.strictEqual(currentURL(), urls[input.addRoute]);
    },
  );

  test.each(
    'can select credential sources for TCP target',
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
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

      instances.tcpTarget.update({
        brokeredCredentialSourceIds: [],
      });
      await visit(urls.brokeredCredentialSourcesForTCPTarget);

      assert.dom(commonSelectors.TABLE_ROWS).isVisible({ count: 0 });

      await click(selectors.MANAGE_DROPDOWN);
      await click(selectors.MANGE_DROPDOWN_ADD_BROKERED_CREDENTIALS);

      assert.strictEqual(
        currentURL(),
        urls.addBrokeredCredentialSourcesForTCPTarget,
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
        urls.brokeredCredentialSourcesForTCPTarget,
      );
      assert
        .dom(commonSelectors.TABLE_ROWS)
        .isVisible({ count: input.expectedCount });
    },
  );

  test.each(
    'can select credential sources for RDP target',
    {
      'save vault generic credential-library': {
        credentialSources: [TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC],
        action: commonSelectors.SAVE_BTN,
        expectedCount: 1,
      },
      'save vault ssh certificate credential-library': {
        credentialSources: [TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE],
        action: commonSelectors.SAVE_BTN,
        expectedCount: 1,
      },
      'save username and password credential': {
        credentialSources: [TYPE_CREDENTIAL_USERNAME_PASSWORD],
        action: commonSelectors.SAVE_BTN,
        expectedCount: 1,
      },
      'save ssh private key credential': {
        credentialSources: [TYPE_CREDENTIAL_SSH_PRIVATE_KEY],
        action: commonSelectors.SAVE_BTN,
        expectedCount: 1,
      },
      'save username, password and domain credential': {
        credentialSources: [TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN],
        action: commonSelectors.SAVE_BTN,
        expectedCount: 1,
      },
      'save json credential': {
        credentialSources: [TYPE_CREDENTIAL_JSON],
        action: commonSelectors.SAVE_BTN,
        expectedCount: 1,
      },
      'save credentials and credential-libraries': {
        credentialSources: [
          TYPE_CREDENTIAL_USERNAME_PASSWORD,
          TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
          TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
          TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
          TYPE_CREDENTIAL_JSON,
          TYPE_CREDENTIAL_SSH_PRIVATE_KEY,
        ],
        action: commonSelectors.SAVE_BTN,
        expectedCount: 6,
      },
      'cancel vault generic credential-library': {
        credentialSources: [TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC],
        action: commonSelectors.CANCEL_BTN,
        expectedCount: 0,
      },
      'cancel vault ssh certificate credential-library': {
        credentialSources: [TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE],
        action: commonSelectors.CANCEL_BTN,
        expectedCount: 0,
      },
      'cancel username and password credential': {
        credentialSources: [TYPE_CREDENTIAL_USERNAME_PASSWORD],
        action: commonSelectors.CANCEL_BTN,
        expectedCount: 0,
      },
      'cancel ssh private key credential': {
        credentialSources: [TYPE_CREDENTIAL_SSH_PRIVATE_KEY],
        action: commonSelectors.CANCEL_BTN,
        expectedCount: 0,
      },
      'cancel username, password and domain credential': {
        credentialSources: [TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN],
        action: commonSelectors.CANCEL_BTN,
        expectedCount: 0,
      },
      'cancel json credential': {
        credentialSources: [TYPE_CREDENTIAL_JSON],
        action: commonSelectors.CANCEL_BTN,
        expectedCount: 0,
      },

      'cancel credentials and credential-libraries': {
        credentialSources: [
          TYPE_CREDENTIAL_USERNAME_PASSWORD,
          TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
          TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
          TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
          TYPE_CREDENTIAL_JSON,
          TYPE_CREDENTIAL_SSH_PRIVATE_KEY,
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
        brokeredCredentialSourceIds: [],
      });
      await visit(urls.brokeredCredentialSourcesForRDPTarget);

      assert.dom(commonSelectors.TABLE_ROWS).isVisible({ count: 0 });

      await click(selectors.MANAGE_DROPDOWN);
      await click(selectors.MANGE_DROPDOWN_ADD_BROKERED_CREDENTIALS);

      assert.strictEqual(
        currentURL(),
        urls.addBrokeredCredentialSourcesForRDPTarget,
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
        urls.brokeredCredentialSourcesForRDPTarget,
      );
      assert
        .dom(commonSelectors.TABLE_ROWS)
        .isVisible({ count: input.expectedCount });
    },
  );

  test.each(
    'cannot add credential sources without proper authorization',
    {
      'for TCP target': {
        route: 'brokeredCredentialSourcesForTCPTarget',
        targetName: 'tcpTarget',
      },
      'for RDP target': {
        route: 'brokeredCredentialSourcesForRDPTarget',
        targetName: 'rdpTarget',
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

      instances[input.targetName].authorized_actions = instances[
        input.targetName
      ].authorized_actions.filter((item) => item !== 'add-credential-sources');
      await visit(urls[input.route]);

      await click(selectors.MANAGE_DROPDOWN);

      assert
        .dom(selectors.MANGE_DROPDOWN_ADD_BROKERED_CREDENTIALS)
        .doesNotExist();
    },
  );

  test.each(
    'adding credential sources which errors displays error message',
    {
      'for TCP target': {
        route: 'addBrokeredCredentialSourcesForTCPTarget',
        targetName: 'tcpTarget',
      },
      'for RDP target': {
        route: 'addBrokeredCredentialSourcesForRDPTarget',
        targetName: 'rdpTarget',
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
      instances[input.targetName].update({
        brokeredCredentialSourceIds: [],
      });
      await visit(urls[input.route]);

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
    },
  );

  test.each(
    'can remove a vault type credential library',
    {
      'for TCP target': {
        route: 'brokeredCredentialSourcesForTCPTarget',
        targetName: 'tcpTarget',
      },
      'for RDP target': {
        route: 'brokeredCredentialSourcesForRDPTarget',
        targetName: 'rdpTarget',
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

      instances[input.targetName].update({
        brokeredCredentialSourceIds: [...randomlySelectedCredentialLibraries],
      });
      const credentialLibraryCount = getCredentialLibraryCount();
      const availableCredentialsCount = getCredentialCount();
      await visit(urls[input.route]);

      assert
        .dom(commonSelectors.TABLE_ROWS)
        .isVisible({ count: credentialLibraryCount });

      await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN);
      await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN_ITEM_BTN);

      assert
        .dom(commonSelectors.TABLE_ROWS)
        .isVisible({ count: credentialLibraryCount - 1 });

      await click(selectors.MANAGE_DROPDOWN);
      await click(selectors.MANGE_DROPDOWN_ADD_BROKERED_CREDENTIALS);

      assert
        .dom(commonSelectors.TABLE_ROWS)
        .isVisible({ count: availableCredentialsCount + 1 });
    },
  );

  test.each(
    'can remove a username & password type credential',
    {
      'for TCP target': {
        route: 'brokeredCredentialSourcesForTCPTarget',
        targetName: 'tcpTarget',
      },
      'for RDP target': {
        route: 'brokeredCredentialSourcesForRDPTarget',
        targetName: 'rdpTarget',
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

      instances[input.targetName].update({
        brokeredCredentialSourceIds: [...randomlySelectedCredentials],
      });
      const credentialCount = getCredentialCount();
      const availableCredentialsCount = getCredentialLibraryCount();
      await visit(urls[input.route]);

      assert
        .dom(commonSelectors.TABLE_ROWS)
        .isVisible({ count: credentialCount });

      await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN);
      await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN_ITEM_BTN);

      assert
        .dom(commonSelectors.TABLE_ROWS)
        .isVisible({ count: credentialCount - 1 });

      await click(selectors.MANAGE_DROPDOWN);
      await click(selectors.MANGE_DROPDOWN_ADD_BROKERED_CREDENTIALS);

      assert
        .dom(commonSelectors.TABLE_ROWS)
        .isVisible({ count: availableCredentialsCount + 1 });
    },
  );

  test.each(
    'cannot remove credential sources without proper authorization',
    {
      'for TCP target': {
        route: 'brokeredCredentialSourcesForTCPTarget',
        targetName: 'tcpTarget',
      },
      'for RDP target': {
        route: 'brokeredCredentialSourcesForRDPTarget',
        targetName: 'rdpTarget',
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

      instances[input.targetName].authorized_actions = instances[
        input.targetName
      ].authorized_actions.filter(
        (item) => item !== 'remove-credential-sources',
      );
      await visit(urls[input.route]);
      assert
        .dom(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN)
        .doesNotExist();
    },
  );

  test.each(
    'removing a credential source which errors displays error messages',
    {
      'for TCP target': {
        route: 'brokeredCredentialSourcesForTCPTarget',
        targetName: 'tcpTarget',
      },
      'for RDP target': {
        route: 'brokeredCredentialSourcesForRDPTarget',
        targetName: 'rdpTarget',
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

      instances[input.targetName].update({
        brokeredCredentialSourceIds: [...randomlySelectedCredentialLibraries],
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
      const count = getCredentialLibraryCount();
      await visit(urls[input.route]);

      assert.dom(commonSelectors.TABLE_ROWS).isVisible({ count });

      await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN);
      await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN_ITEM_BTN);

      assert.dom(commonSelectors.ALERT_TOAST_BODY).isVisible();
    },
  );

  test.each(
    'removing a credential which errors displays error messages',
    {
      'for TCP target': {
        route: 'brokeredCredentialSourcesForTCPTarget',
        targetName: 'tcpTarget',
      },
      'for RDP target': {
        route: 'brokeredCredentialSourcesForRDPTarget',
        targetName: 'rdpTarget',
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

      instances[input.targetName].update({
        brokeredCredentialSourceIds: [...randomlySelectedCredentials],
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
      const count = getCredentialCount();
      await visit(urls[input.route]);

      assert.dom(commonSelectors.TABLE_ROWS).isVisible({ count });

      await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN);
      await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN_ITEM_BTN);

      assert.dom(commonSelectors.ALERT_TOAST_BODY).isVisible();
    },
  );
});
