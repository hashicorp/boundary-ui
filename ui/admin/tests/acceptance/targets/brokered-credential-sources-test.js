/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, findAll, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';

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
    assert.strictEqual(findAll('tbody tr').length, credentialSourceCount);
  });

  test('can navigate to a vault type credential library', async function (assert) {
    await visit(urls.brokeredCredentialSources);
    await click('main tbody tr .hds-table__td:nth-child(1) a');
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.credentialLibrary);
  });

  test('can navigate to a username & password type credential', async function (assert) {
    instances.target.update({
      brokeredCredentialSourceIds: [...randomlySelectedCredentials],
    });
    await visit(urls.brokeredCredentialSources);
    await click('main tbody tr .hds-table__td:nth-child(1) a');
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
    assert.dom('.hds-table__tr:nth-child(3)').includesText(jsonCredential.name);
    assert.dom(`[href="${urls.jsonCredential}"]`).doesNotExist();
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
    assert.strictEqual(findAll('tbody tr').length, credentialSourceCount);
    assert.dom('.hds-application-state__title').doesNotExist();
  });

  test('displays list of brokered credential sources with only credential libraries available', async function (assert) {
    instances.target.update({
      brokeredCredentialSourceIds: [...randomlySelectedCredentials],
    });
    await visit(urls.addBrokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, getCredentialLibraryCount());
    assert.dom('.hds-application-state__title').doesNotExist();
  });

  test('displays no brokered credential sources message when none available', async function (assert) {
    await visit(urls.addBrokeredCredentialSources);
    assert
      .dom('.hds-application-state__title')
      .hasText('No Brokered Credential Sources Available');
  });

  test('when no brokered credential sources available, button routes to add brokered credential sources', async function (assert) {
    instances.target.update({
      brokeredCredentialSourceIds: [],
    });
    await visit(urls.brokeredCredentialSources);
    // Click on the rose message link
    await click('.hds-application-state__footer .hds-link-standalone');
    assert.strictEqual(currentURL(), urls.addBrokeredCredentialSources);
  });

  test('can select and save a vault type credential library to add', async function (assert) {
    instances.target.update({
      brokeredCredentialSourceIds: [],
    });
    await visit(urls.brokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, 0);
    await visit(urls.addBrokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialSourceCount);
    await click('tbody tr:first-child label');
    await click('form [type="submit"]');
    assert.strictEqual(currentURL(), urls.brokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, 1);
  });

  test('can select and save a username & password type credential to add', async function (assert) {
    instances.target.update({
      brokeredCredentialSourceIds: [],
    });
    await visit(urls.brokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, 0);
    await visit(urls.addBrokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialSourceCount);
    await click('tbody tr:last-child label');
    await click('form [type="submit"]');
    assert.strictEqual(currentURL(), urls.brokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, 1);
  });

  test('can select and save both a credential-library and a credential to add', async function (assert) {
    instances.target.update({
      brokeredCredentialSourceIds: [],
    });
    await visit(urls.brokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, 0);
    await visit(urls.addBrokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialSourceCount);
    await click('tbody tr:last-child label');
    await click('tbody tr:first-child label');
    await click('form [type="submit"]');
    assert.strictEqual(currentURL(), urls.brokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, 2);
  });

  test('cannot add credential sources without proper authorization', async function (assert) {
    instances.target.authorized_actions =
      instances.target.authorized_actions.filter(
        (item) => item !== 'add-credential-sources',
      );
    await visit(urls.brokeredCredentialSources);
    assert.dom('[data-test-add-brokered-cred-sources-action]').doesNotExist();
  });

  test('can select and cancel credential sources to add', async function (assert) {
    instances.target.update({
      brokeredCredentialSourceIds: [],
    });
    await visit(urls.brokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, 0);
    await visit(urls.addBrokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialSourceCount);
    await click('tbody label');
    await click('form [type="button"]');
    assert.strictEqual(currentURL(), urls.brokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, 0);
  });

  test('can select multiple brokered credential sources to add and cancel', async function (assert) {
    instances.target.update({
      brokeredCredentialSourceIds: [],
    });
    await visit(urls.brokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, 0);
    await visit(urls.addBrokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialSourceCount);
    await click('tbody tr:last-child label');
    await click('tbody tr:first-child label');
    await click('form [type="button"]');
    assert.strictEqual(currentURL(), urls.brokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, 0);
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
    await click('tbody tr:last-child label');
    await click('tbody tr:first-child label');
    await click('form [type="submit"]');
    assert.dom(commonSelectors.ALERT_TOAST_BODY).isVisible();
  });

  test('can remove a vault type credential library', async function (assert) {
    instances.target.update({
      brokeredCredentialSourceIds: [...randomlySelectedCredentialLibraries],
    });
    const credentialLibraryCount = getCredentialLibraryCount();
    const availableCredentialsCount = getCredentialCount();
    await visit(urls.brokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialLibraryCount);
    await click('.hds-dropdown-toggle-icon');
    await click('tbody tr .hds-dropdown-list-item button');
    assert.strictEqual(findAll('tbody tr').length, credentialLibraryCount - 1);
    await visit(urls.addBrokeredCredentialSources);
    assert.strictEqual(
      findAll('tbody tr').length,
      availableCredentialsCount + 1,
    );
  });

  test('can remove a username & password type credential', async function (assert) {
    instances.target.update({
      brokeredCredentialSourceIds: [...randomlySelectedCredentials],
    });
    const credentialCount = getCredentialCount();
    const availableCredentialsCount = getCredentialLibraryCount();
    await visit(urls.brokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialCount);
    await click('.hds-dropdown-toggle-icon');
    await click('tbody tr .hds-dropdown-list-item button');
    assert.strictEqual(findAll('tbody tr').length, credentialCount - 1);
    await visit(urls.addBrokeredCredentialSources);
    assert.strictEqual(
      findAll('tbody tr').length,
      availableCredentialsCount + 1,
    );
  });

  test('cannot remove credential libraries without proper authorization', async function (assert) {
    instances.target.authorized_actions =
      instances.target.authorized_actions.filter(
        (item) => item !== 'remove-credential-sources',
      );
    await visit(urls.brokeredCredentialSources);
    assert.dom('tbody tr .hds-dropdown-list-item button').doesNotExist();
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
    assert.strictEqual(findAll('tbody tr').length, count);
    await click('.hds-dropdown-toggle-icon');
    await click('tbody tr .hds-dropdown-list-item button');
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
    assert.strictEqual(findAll('tbody tr').length, count);
    await click('.hds-dropdown-toggle-icon');
    await click('tbody tr .hds-dropdown-list-item button');
    assert.dom(commonSelectors.ALERT_TOAST_BODY).isVisible();
  });
});
