/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, click, currentURL, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE } from 'api/models/credential-library';

module('Acceptance | credential-libraries | read', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

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
  };

  hooks.beforeEach(function () {
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
    authenticateSession({});
  });

  test('can navigate to resource', async function (assert) {
    assert.expect(1);
    await visit(urls.credentialLibraries);
    await click('main tbody .rose-table-header-cell a');
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.credentialLibrary);
  });

  test('cannot navigate to resource without proper authorization', async function (assert) {
    assert.expect(1);
    instances.credentialLibrary.authorized_actions =
      instances.credentialLibrary.authorized_actions.filter(
        (item) => item !== 'read'
      );
    await visit(urls.credentialLibraries);
    assert.notOk(find('main tbody .rose-table-header-cell a'));
  });

  test('cannot navigate to vault ssh cert form when feature is not enabled', async function (assert) {
    assert.expect(1);
    instances.credentialLibrary = this.server.create('credential-library', {
      scope: instances.scopes.project,
      credentialStore: instances.credentialStore,
      type: TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
    });
    await visit(
      `${urls.credentialLibraries}/${instances.credentialLibrary.id}`
    );
    const featuresService = this.owner.lookup('service:features');
    featuresService.disable('ssh-target');
    await visit(urls.credentialLibraries);

    assert.dom('.rose-table-body tr:nth-of-type(2) a').doesNotExist();
  });

  test('visiting an unknown credential library displays 404 message', async function (assert) {
    assert.expect(1);
    await visit(urls.unknownCredentialLibrary);
    await a11yAudit();
    assert.ok(find('.rose-message-subtitle').textContent.trim(), 'Error 404');
  });
});
