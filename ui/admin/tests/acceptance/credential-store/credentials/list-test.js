/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as credentialStoreSelectors from '../selectors';

module('Acceptance | credential-stores | credentials | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupSqlite(hooks);

  const instances = {
    scopes: {
      org: null,
      project: null,
    },
    staticCredentialStore: null,
    usernamePasswordCredential: null,
    usernameKeyPairCredential: null,
    jsonCredential: null,
  };

  const urls = {
    projectScope: null,
    credentialStores: null,
    staticCredentialStore: null,
    credentials: null,
    newCredential: null,
  };

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
    instances.staticCredentialStore = this.server.create('credential-store', {
      scope: instances.scopes.project,
      type: 'static',
    });
    instances.usernamePasswordCredential = this.server.create('credential', {
      scope: instances.scopes.project,
      credentialStore: instances.staticCredentialStore,
      type: 'username_password',
    });
    instances.usernameKeyPairCredential = this.server.create('credential', {
      scope: instances.scopes.project,
      credentialStore: instances.staticCredentialStore,
      type: 'ssh_private_key',
    });
    instances.jsonCredential = this.server.create('credential', {
      scope: instances.scopes.project,
      credentialStore: instances.staticCredentialStore,
      type: 'json',
    });
    // Generate route URLs for resources
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.credentialStores = `${urls.projectScope}/credential-stores`;
    urls.staticCredentialStore = `${urls.credentialStores}/${instances.staticCredentialStore.id}`;
    urls.credentials = `${urls.staticCredentialStore}/credentials`;
    urls.newCredential = `${urls.staticCredentialStore}/credentials/new`;
    await authenticateSession({});
  });

  test('Users can navigate to credentials with proper authorization', async function (assert) {
    await visit(urls.staticCredentialStore);

    assert.ok(
      instances.staticCredentialStore.authorized_collection_actions.credentials.includes(
        'list',
      ),
    );
    assert.dom(commonSelectors.HREF(urls.credentials)).isVisible();

    await click(commonSelectors.HREF(urls.credentials));

    assert.strictEqual(currentURL(), urls.credentials);
    assert
      .dom(commonSelectors.TABLE_ROWS)
      .isVisible({ count: this.server.schema.credentials.all().models.length });
  });

  test('User cannot navigate to Credentials tab without either list or create action', async function (assert) {
    instances.staticCredentialStore.authorized_collection_actions.credentials =
      [];
    await visit(urls.staticCredentialStore);

    assert.notOk(
      instances.staticCredentialStore.authorized_collection_actions.credentials.includes(
        'list',
      ),
    );
    assert.notOk(
      instances.staticCredentialStore.authorized_collection_actions.credentials.includes(
        'create',
      ),
    );
    assert.dom(commonSelectors.HREF(urls.credentials)).doesNotExist();
  });

  test('User can navigate to new credential screen with only create action', async function (assert) {
    instances.staticCredentialStore.authorized_collection_actions.credentials =
      ['create'];
    await visit(urls.staticCredentialStore);

    assert.dom(commonSelectors.HREF(urls.credentials)).isVisible();

    await click(credentialStoreSelectors.MANAGE_DROPDOWN);

    assert.dom(credentialStoreSelectors.NEW_CREDENTIAL_ACTION).isVisible();
  });
});
