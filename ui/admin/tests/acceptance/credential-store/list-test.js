/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, fillIn, waitFor } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';
import {
  TYPE_CREDENTIAL_STORE_STATIC,
  TYPE_CREDENTIAL_STORE_VAULT,
} from 'api/models/credential-store';

module('Acceptance | credential-stores | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  const SEARCH_INPUT_SELECTOR = '.search-filtering [type="search"]';
  const NO_RESULTS_MSG_SELECTOR = '[data-test-no-credential-store-results]';
  const FILTER_DROPDOWN_SELECTOR = (name) =>
    `.search-filtering [name="${name}"] button`;
  const FILTER_APPLY_BUTTON_SELECTOR =
    '.search-filtering [data-test-dropdown-apply-button]';

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    staticCredentialStore: null,
    vaultCredentialStore: null,
  };

  const urls = {
    orgScope: null,
    projectScope: null,
    credentialStores: null,
    staticCredentialStore: null,
    vaultCredentialStore: null,
  };

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    instances.staticCredentialStore = this.server.create('credential-store', {
      scope: instances.scopes.project,
      type: TYPE_CREDENTIAL_STORE_STATIC,
    });
    instances.vaultCredentialStore = this.server.create('credential-store', {
      scope: instances.scopes.project,
      type: TYPE_CREDENTIAL_STORE_VAULT,
    });
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.credentialStores = `${urls.projectScope}/credential-stores`;
    urls.staticCredentialStore = `${urls.credentialStores}/${instances.staticCredentialStore.id}`;
    urls.vaultCredentialStore = `${urls.credentialStores}/${instances.vaultCredentialStore.id}`;

    const featuresService = this.owner.lookup('service:features');
    featuresService.enable('static-credentials');
    authenticateSession({});
  });

  test('users can navigate to credential-stores with proper authorization', async function (assert) {
    await visit(urls.orgScope);

    await click(`[href="${urls.projectScope}"]`);

    assert.true(
      instances.scopes.project.authorized_collection_actions[
        'credential-stores'
      ].includes('list'),
    );
    assert.dom(`[href="${urls.credentialStores}"]`).exists();
  });

  test('users cannot navigate to index without either list or create actions', async function (assert) {
    instances.scopes.project.authorized_collection_actions[
      'credential-stores'
    ] = [];
    await visit(urls.orgScope);

    await click(`[href="${urls.projectScope}"]`);

    assert.false(
      instances.scopes.project.authorized_collection_actions[
        'credential-stores'
      ].includes('list'),
    );
    assert.false(
      instances.scopes.project.authorized_collection_actions[
        'credential-stores'
      ].includes('create'),
    );
    assert.dom(`[href="${urls.credentialStores}"]`).doesNotExist();
  });

  test('users can navigate to index with only create action', async function (assert) {
    instances.scopes.project.authorized_collection_actions[
      'credential-stores'
    ] = ['create'];
    await visit(urls.orgScope);

    await click(`[href="${urls.projectScope}"]`);

    assert.dom(`[href="${urls.credentialStores}"]`).exists();
  });

  test('users can link to docs page for credential stores', async function (assert) {
    await visit(urls.projectScope);

    await click(`[href="${urls.credentialStores}"]`);

    assert
      .dom(
        `[href="https://developer.hashicorp.com/boundary/docs/concepts/domain-model/credential-stores"]`,
      )
      .exists();
  });

  test('user can search for a specific credential-store by id', async function (assert) {
    await visit(urls.projectScope);

    await click(`[href="${urls.credentialStores}"]`);

    assert.dom(`[href="${urls.staticCredentialStore}"]`).exists();
    assert.dom(`[href="${urls.vaultCredentialStore}"]`).exists();

    await fillIn(SEARCH_INPUT_SELECTOR, instances.staticCredentialStore.id);
    await waitFor(`[href="${urls.vaultCredentialStore}"]`, { count: 0 });

    assert.dom(`[href="${urls.staticCredentialStore}"]`).exists();
    assert.dom(`[href="${urls.vaultCredentialStore}"]`).doesNotExist();
  });

  test('user can search for credential-stores and get no results', async function (assert) {
    await visit(urls.projectScope);

    await click(`[href="${urls.credentialStores}"]`);

    assert.dom(`[href="${urls.staticCredentialStore}"]`).exists();
    assert.dom(`[href="${urls.vaultCredentialStore}"]`).exists();

    await fillIn(SEARCH_INPUT_SELECTOR, 'fake cred store that does not exist');
    await waitFor(NO_RESULTS_MSG_SELECTOR, { count: 1 });

    assert.dom(`[href="${urls.staticCredentialStore}"]`).doesNotExist();
    assert.dom(`[href="${urls.vaultCredentialStore}"]`).doesNotExist();
    assert.dom(NO_RESULTS_MSG_SELECTOR).includesText('No results found');
  });

  test('user can filter for credential-stores by type', async function (assert) {
    await visit(urls.projectScope);

    await click(`[href="${urls.credentialStores}"]`);

    assert.dom(`[href="${urls.staticCredentialStore}"]`).exists();
    assert.dom(`[href="${urls.vaultCredentialStore}"]`).exists();

    await click(FILTER_DROPDOWN_SELECTOR('type'));
    await click(`input[value="${TYPE_CREDENTIAL_STORE_VAULT}"]`);
    await click(FILTER_APPLY_BUTTON_SELECTOR);

    assert.dom(`[href="${urls.staticCredentialStore}"]`).doesNotExist();
    assert.dom(`[href="${urls.vaultCredentialStore}"]`).exists();
  });
});
