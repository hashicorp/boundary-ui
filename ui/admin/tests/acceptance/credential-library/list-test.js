/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import { TYPE_CREDENTIAL_LIBRARY_VAULT_LDAP } from 'api/models/credential-library';

module('Acceptance | credential-libraries | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupSqlite(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
  };

  const urls = {
    credentialStores: null,
    credentialStore: null,
    credentialLibrary: null,
    credentialLibraries: null,
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
    instances.credentialStore = this.server.create('credential-store', {
      scope: instances.scopes.project,
    });
    instances.credentialLibrary = this.server.create('credential-library', {
      scope: instances.scopes.project,
      credentialStore: instances.credentialStore,
    });
    instances.vaultLDAPCredentialLibrary = this.server.create(
      'credential-library',
      {
        scope: instances.scopes.project,
        credentialStore: instances.credentialStore,
        type: TYPE_CREDENTIAL_LIBRARY_VAULT_LDAP,
      },
    );
    // Generate route URLs for resources
    urls.credentialStores = `/scopes/${instances.scopes.project.id}/credential-stores`;
    urls.credentialStore = `${urls.credentialStores}/${instances.credentialStore.id}`;
    urls.credentialLibraries = `${urls.credentialStore}/credential-libraries`;
    urls.vaultLDAPCredentialLibrary = `${urls.credentialLibraries}/${instances.vaultLDAPCredentialLibrary.id}`;
    await authenticateSession({});
  });

  test('Users can navigate to credential libraries with proper authorization', async function (assert) {
    await visit(urls.credentialStore);

    assert.ok(
      instances.credentialStore.authorized_collection_actions[
        'credential-libraries'
      ].includes('list'),
    );
    assert.dom(commonSelectors.HREF(urls.credentialLibraries)).isVisible();
  });

  test('Users cannot navigate to index without either list or create actions', async function (assert) {
    instances.credentialStore.authorized_collection_actions[
      'credential-libraries'
    ] = [];

    await visit(urls.credentialStore);

    assert.notOk(
      instances.credentialStore.authorized_collection_actions[
        'credential-libraries'
      ].includes('list'),
    );
    assert.dom(commonSelectors.HREF(urls.credentialLibraries)).doesNotExist();
  });

  test('Users can navigate to index with only create action', async function (assert) {
    instances.credentialStore.authorized_collection_actions[
      'credential-libraries'
    ] = ['create'];

    await visit(urls.credentialStore);

    assert.dom(commonSelectors.HREF(urls.credentialLibraries)).isVisible();
  });

  test('User can navigate to vault ldap credential library details', async function (assert) {
    await visit(urls.credentialLibraries);

    assert
      .dom(commonSelectors.TABLE_RESOURCE_LINK(urls.vaultLDAPCredentialLibrary))
      .isVisible();
  });
});
