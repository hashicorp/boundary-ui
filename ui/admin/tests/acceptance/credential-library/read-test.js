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
import { TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE } from 'api/models/credential-library';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | credential-libraries | read', function (hooks) {
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
    globalScope: null,
    orgScope: null,
    projectScope: null,
    credentialStores: null,
    credentialStore: null,
    credentialLibrary: null,
    credentialLibraries: null,
    newCredentialLibrary: null,
    unknownCredentialLibrary: null,
    vaultSshCredentialLibrary: null,
  };

  hooks.beforeEach(async function () {
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
    instances.credentialStore = this.server.create('credential-store', {
      scope: instances.scopes.project,
    });
    instances.credentialLibrary = this.server.create('credential-library', {
      scope: instances.scopes.project,
      credentialStore: instances.credentialStore,
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.credentialStores = `${urls.projectScope}/credential-stores`;
    urls.credentialStore = `${urls.credentialStores}/${instances.credentialStore.id}`;
    urls.credentialLibraries = `${urls.credentialStore}/credential-libraries`;
    urls.credentialLibrary = `${urls.credentialLibraries}/${instances.credentialLibrary.id}`;
    urls.newCredentialLibrary = `${urls.credentialLibraries}/new`;
    urls.unknownCredentialLibrary = `${urls.credentialLibraries}/foo`;
    await authenticateSession({ username: 'admin' });
  });

  test('can navigate to resource', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.credentialLibraries);

    await click(commonSelectors.TABLE_RESOURCE_LINK(urls.credentialLibrary));

    assert.strictEqual(currentURL(), urls.credentialLibrary);
  });

  test('cannot navigate to resource without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.credentialLibrary.authorized_actions =
      instances.credentialLibrary.authorized_actions.filter(
        (item) => item !== 'read',
      );
    await visit(urls.credentialLibraries);

    assert
      .dom(commonSelectors.TABLE_RESOURCE_LINK(urls.credentialLibrary))
      .doesNotExist();
  });

  test('cannot navigate to vault ssh cert form when feature is not enabled', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.credentialLibrary = this.server.create('credential-library', {
      scope: instances.scopes.project,
      credentialStore: instances.credentialStore,
      type: TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
    });
    urls.vaultSshCredentialLibrary = `${urls.credentialLibraries}/${instances.credentialLibrary.id}`;
    await visit(urls.credentialLibraries);
    const featuresService = this.owner.lookup('service:features');

    assert.false(featuresService.isEnabled('ssh-target'));
    assert
      .dom(commonSelectors.TABLE_RESOURCE_LINK(urls.credentialLibrary))
      .isVisible();
    assert
      .dom(commonSelectors.TABLE_RESOURCE_LINK(urls.vaultSshCredentialLibrary))
      .doesNotExist();
  });

  test('visiting an unknown credential library displays 404 message', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.unknownCredentialLibrary);

    assert
      .dom(commonSelectors.RESOURCE_NOT_FOUND_SUBTITLE)
      .hasText(commonSelectors.RESOURCE_NOT_FOUND_VALUE);
  });

  test('users can navigate to credential library and incorrect url auto-corrects', async function (assert) {
    const credentialStore = this.server.create('credential-store', {
      scope: instances.scopes.project,
    });
    const credentialLibrary = this.server.create('credential-library', {
      scope: instances.scopes.project,
      credentialStore,
    });
    const incorrectUrl = `${urls.credentialLibraries}/${credentialLibrary.id}`;
    const correctUrl = `${urls.projectScope}/credential-stores/${credentialStore.id}/credential-libraries/${credentialLibrary.id}`;

    await visit(incorrectUrl);

    assert.notEqual(currentURL(), incorrectUrl);
    assert.strictEqual(currentURL(), correctUrl);
  });
});
