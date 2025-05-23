/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, fillIn, waitFor } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { authenticateSession } from 'ember-simple-auth/test-support';
import {
  TYPE_CREDENTIAL_STORE_STATIC,
  TYPE_CREDENTIAL_STORE_VAULT,
} from 'api/models/credential-store';
import * as selectors from './selectors';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | credential-stores | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

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

  hooks.beforeEach(async function () {
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
    await authenticateSession({});
  });

  test('users can navigate to credential-stores with proper authorization', async function (assert) {
    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.projectScope));

    assert.true(
      instances.scopes.project.authorized_collection_actions[
        'credential-stores'
      ].includes('list'),
    );
    assert.dom(commonSelectors.HREF(urls.credentialStores)).isVisible();
  });

  test('users cannot navigate to index without either list or create actions', async function (assert) {
    instances.scopes.project.authorized_collection_actions[
      'credential-stores'
    ] = [];
    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.projectScope));

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
    assert.dom(commonSelectors.HREF(urls.credentialStores)).doesNotExist();
  });

  test('users can navigate to index with only create action', async function (assert) {
    instances.scopes.project.authorized_collection_actions[
      'credential-stores'
    ] = ['create'];
    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.projectScope));

    assert.dom(commonSelectors.HREF(urls.credentialStores)).isVisible();
  });

  test('users can link to docs page for credential stores', async function (assert) {
    await visit(urls.projectScope);

    await click(commonSelectors.HREF(urls.credentialStores));

    assert
      .dom(
        `[href="https://developer.hashicorp.com/boundary/docs/concepts/domain-model/credential-stores"]`,
      )
      .isVisible();
  });

  test('user can search for a specific credential-store by id', async function (assert) {
    await visit(urls.projectScope);

    await click(commonSelectors.HREF(urls.credentialStores));

    assert.dom(commonSelectors.HREF(urls.staticCredentialStore)).isVisible();
    assert.dom(commonSelectors.HREF(urls.vaultCredentialStore)).isVisible();

    await fillIn(
      commonSelectors.SEARCH_INPUT,
      instances.staticCredentialStore.id,
    );
    await waitFor(commonSelectors.HREF(urls.vaultCredentialStore), {
      count: 0,
    });

    assert.dom(commonSelectors.HREF(urls.staticCredentialStore)).isVisible();
    assert.dom(commonSelectors.HREF(urls.vaultCredentialStore)).doesNotExist();
  });

  test('user can search for credential-stores and get no results', async function (assert) {
    await visit(urls.projectScope);

    await click(commonSelectors.HREF(urls.credentialStores));

    assert.dom(commonSelectors.HREF(urls.staticCredentialStore)).isVisible();
    assert.dom(commonSelectors.HREF(urls.vaultCredentialStore)).isVisible();

    await fillIn(
      commonSelectors.SEARCH_INPUT,
      'fake cred store that does not exist',
    );
    await waitFor(selectors.NO_RESULTS_MSG, { count: 1 });

    assert.dom(commonSelectors.HREF(urls.staticCredentialStore)).doesNotExist();
    assert.dom(commonSelectors.HREF(urls.vaultCredentialStore)).doesNotExist();
    assert.dom(selectors.NO_RESULTS_MSG).includesText('No results found');
  });

  test('user can filter for credential-stores by type', async function (assert) {
    await visit(urls.projectScope);

    await click(commonSelectors.HREF(urls.credentialStores));

    assert.dom(commonSelectors.HREF(urls.staticCredentialStore)).isVisible();
    assert.dom(commonSelectors.HREF(urls.vaultCredentialStore)).isVisible();

    await click(commonSelectors.FILTER_DROPDOWN('type'));

    await click(
      commonSelectors.FILTER_DROPDOWN_ITEM(TYPE_CREDENTIAL_STORE_VAULT),
    );
    await click(commonSelectors.FILTER_DROPDOWN_ITEM_APPLY_BTN('type'));

    assert.dom(commonSelectors.HREF(urls.staticCredentialStore)).doesNotExist();
    assert.dom(commonSelectors.HREF(urls.vaultCredentialStore)).isVisible();
  });
});
