/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { TYPE_CREDENTIAL_USERNAME_PASSWORD } from 'api/models/credential';
import { TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC } from 'api/models/credential-library';

module('Acceptance | targets | brokered credential sources', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

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
    target: null,
    credentialLibraries: null,
    credentialLibrary: null,
    credential: null,
    jsonCredential: null,
    addBrokeredCredentialSources: null,
    brokeredCredentialSources: null,
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
    instances.credentials = this.server.createList('credential', 3, {
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
    instances.target = this.server.create('target', {
      scope: instances.scopes.project,
    });

    randomlySelectedCredentials = this.server.schema.credentials
      .all()
      .models.map((cred) => cred.id);
    randomlySelectedCredentialLibraries = this.server.schema.credentialLibraries
      .all()
      .models.map((cred) => cred.id);
    instances.target.update({
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
    urls.target = `${urls.targets}/${instances.target.id}`;
    urls.brokeredCredentialSources = `${urls.target}/brokered-credential-sources`;
    urls.credentialLibrary = `${urls.projectScope}/credential-stores/${instances.credentialLibrary.credentialStoreId}/credential-libraries/${instances.credentialLibrary.id}`;
    urls.credential = `${urls.projectScope}/credential-stores/${instances.credential.credentialStoreId}/credentials/${instances.credential.id}`;
    urls.jsonCredential = `${urls.projectScope}/credential-stores/${instances.credentials[2].credentialStoreId}/credentials/${instances.credentials[2].id}`;
    urls.addBrokeredCredentialSources = `${urls.target}/add-brokered-credential-sources`;
    getCredentialLibraryCount = () =>
      this.server.schema.credentialLibraries.all().models.length;
    getCredentialCount = () =>
      this.server.schema.credentials.all().models.length;
    credentialSourceCount = getCredentialLibraryCount() + getCredentialCount();

    await authenticateSession({ username: 'admin' });
  });

  test('visiting target brokered credential sources', async function (assert) {
    await visit(urls.brokeredCredentialSources);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.brokeredCredentialSources);
    assert
      .dom(commonSelectors.TABLE_ROWS)
      .isVisible({ count: credentialSourceCount });
  });

  test('can navigate to a vault type credential library', async function (assert) {
    await visit(urls.brokeredCredentialSources);

    await click(commonSelectors.TABLE_RESOURCE_LINK(urls.credentialLibrary));
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.credentialLibrary);
  });

  test('can navigate to a username & password type credential', async function (assert) {
    instances.target.update({
      brokeredCredentialSourceIds: [...randomlySelectedCredentials],
    });
    await visit(urls.brokeredCredentialSources);

    await click(commonSelectors.TABLE_RESOURCE_LINK(urls.credential));
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.credential);
  });

  test('cannot navigate to a json type credential when feature is disabled', async function (assert) {
    const jsonCredential = instances.credentials[2];
    instances.target.update({
      brokeredCredentialSourceIds: [...randomlySelectedCredentials],
    });
    await visit(urls.brokeredCredentialSources);

    assert.false(featuresService.isEnabled('json-credentials'));
    assert.dom(commonSelectors.TABLE_ROW(3)).includesText(jsonCredential.name);
    assert.dom(commonSelectors.HREF(urls.jsonCredential)).doesNotExist();
  });

  test('visiting add brokered credential sources', async function (assert) {
    await visit(urls.addBrokeredCredentialSources);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.addBrokeredCredentialSources);
  });

  test('displays list of all brokered credential source types available', async function (assert) {
    instances.target.update({
      brokeredCredentialSourceIds: [],
    });
    await visit(urls.addBrokeredCredentialSources);

    assert
      .dom(commonSelectors.TABLE_ROWS)
      .isVisible({ count: credentialSourceCount });
    assert.dom(commonSelectors.PAGE_MESSAGE_HEADER).doesNotExist();
  });

  test('displays list of brokered credential sources with only credential libraries available', async function (assert) {
    instances.target.update({
      brokeredCredentialSourceIds: [...randomlySelectedCredentials],
    });
    await visit(urls.addBrokeredCredentialSources);

    assert
      .dom(commonSelectors.TABLE_ROWS)
      .isVisible({ count: getCredentialLibraryCount() });
    assert.dom(commonSelectors.PAGE_MESSAGE_HEADER).doesNotExist();
  });

  test('displays no brokered credential sources message when none available', async function (assert) {
    await visit(urls.addBrokeredCredentialSources);

    assert
      .dom(commonSelectors.PAGE_MESSAGE_HEADER)
      .hasText('No Brokered Credential Sources Available');
  });

  test('when no brokered credential sources available, button routes to add brokered credential sources', async function (assert) {
    instances.target.update({
      brokeredCredentialSourceIds: [],
    });
    await visit(urls.brokeredCredentialSources);

    // Click on the rose message link
    await click(commonSelectors.PAGE_MESSAGE_LINK);

    assert.strictEqual(currentURL(), urls.addBrokeredCredentialSources);
  });

  test.each(
    'can select credential sources',
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
      instances.target.update({
        brokeredCredentialSourceIds: [],
      });
      await visit(urls.brokeredCredentialSources);

      assert.dom(commonSelectors.TABLE_ROWS).isVisible({ count: 0 });

      await click(selectors.MANAGE_DROPDOWN);
      await click(selectors.MANGE_DROPDOWN_ADD_BROKERED_CREDENTIALS);

      assert.strictEqual(currentURL(), urls.addBrokeredCredentialSources);
      assert
        .dom(commonSelectors.TABLE_ROWS)
        .isVisible({ count: credentialSourceCount });

      for (const type of input.credentialSources) {
        await click(selectors.TABLE_CREDENTIAL_SOURCE_CHECKBOX(type));
      }
      await click(input.action);

      assert.strictEqual(currentURL(), urls.brokeredCredentialSources);
      assert
        .dom(commonSelectors.TABLE_ROWS)
        .isVisible({ count: input.expectedCount });
    },
  );

  test('cannot add credential sources without proper authorization', async function (assert) {
    instances.target.authorized_actions =
      instances.target.authorized_actions.filter(
        (item) => item !== 'add-credential-sources',
      );
    await visit(urls.brokeredCredentialSources);

    await click(selectors.MANAGE_DROPDOWN);

    assert
      .dom(selectors.MANGE_DROPDOWN_ADD_BROKERED_CREDENTIALS)
      .doesNotExist();
  });

  test('adding credential sources which errors displays error message', async function (assert) {
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
    instances.target.update({
      brokeredCredentialSourceIds: [],
    });
    await visit(urls.addBrokeredCredentialSources);

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

  test('can remove a vault type credential library', async function (assert) {
    instances.target.update({
      brokeredCredentialSourceIds: [...randomlySelectedCredentialLibraries],
    });
    const credentialLibraryCount = getCredentialLibraryCount();
    await visit(urls.brokeredCredentialSources);

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
      .isVisible({ count: credentialLibraryCount + 1 });
  });

  test('can remove a username & password type credential', async function (assert) {
    instances.target.update({
      brokeredCredentialSourceIds: [...randomlySelectedCredentials],
    });
    const credentialCount = getCredentialCount();
    await visit(urls.brokeredCredentialSources);

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
      .isVisible({ count: credentialCount + 1 });
  });

  test('cannot remove credential libraries without proper authorization', async function (assert) {
    instances.target.authorized_actions =
      instances.target.authorized_actions.filter(
        (item) => item !== 'remove-credential-sources',
      );
    await visit(urls.brokeredCredentialSources);

    assert.dom(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN).doesNotExist();
  });

  test('removing a target credential library which errors displays error messages', async function (assert) {
    instances.target.update({
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
    await visit(urls.brokeredCredentialSources);

    assert.dom(commonSelectors.TABLE_ROWS).isVisible({ count });

    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN);
    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN_ITEM_BTN);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).isVisible();
  });

  test('removing a target credential which errors displays error messages', async function (assert) {
    instances.target.update({
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
    await visit(urls.brokeredCredentialSources);

    assert.dom(commonSelectors.TABLE_ROWS).isVisible({ count });

    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN);
    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN_ITEM_BTN);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).isVisible();
  });
});
