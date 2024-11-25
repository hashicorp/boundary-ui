/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { visit, click, currentURL } from '@ember/test-helpers';

import { TYPE_CREDENTIAL_STORE_VAULT } from 'api/models/credential-store';

module('Acceptance | credential-stores | edit worker filter', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  // data-test-formatted-worker-filter
  // data-test-worker-filter-empty-state
  // data-test-edit-worker-filter

  const EDIT_WORKER_FILTER = '[data-test-edit-worker-filter]';
  const FORMATTED_WORKER_FILTER = '[data-test-formatted-worker-filter]';
  const WORKER_FILTER_EMPTY_STATE = '[data-test-worker-filter-empty-state]';

  console.log(
    EDIT_WORKER_FILTER,
    '++',
    FORMATTED_WORKER_FILTER,
    '++',
    WORKER_FILTER_EMPTY_STATE,
  );

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    vaultCredentialStore: null,
  };

  const urls = {
    orgScope: null,
    projectScope: null,
    credentialStores: null,
    vaultCredentialStore: null,
  };

  console.log(instances, '++', urls);

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
    instances.vaultCredentialStore = this.server.create('credential-store', {
      scope: instances.scopes.project,
      type: TYPE_CREDENTIAL_STORE_VAULT,
    });
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.credentialStores = `${urls.projectScope}/credential-stores`;
    urls.vaultCredentialStore = `${urls.credentialStores}/${instances.vaultCredentialStore.id}`;

    const featuresService = this.owner.lookup('service:features');
    const featureEdition = this.owner.lookup('service:featureEdition');

    featuresService.enable('vault-worker-filter');
    featureEdition.setEdition('hcp');

    authenticateSession({ username: 'admin' });
    console.log(featuresService, '++', featureEdition);
  });

  test('user can navigate to credential stores with proper authorization', async function (assert) {
    await visit(urls.orgScope);

    await click(`[href="${urls.projectScope}"]`);

    assert.dom(`[href="${urls.credentialStores}"]`).exists();

    await click(`[href="${urls.credentialStores}"]`);

    assert.strictEqual(currentURL(), urls.credentialStores);
  });

  test('vault credential store is present', async function (assert) {
    await visit(urls.orgScope);

    await click(`[href="${urls.projectScope}"]`);

    await click(`[href="${urls.credentialStores}"]`);

    assert.dom(`[href="${urls.vaultCredentialStore}"]`).exists();
  });
});
