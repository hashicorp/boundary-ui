/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, find, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | credential-stores | credentials | read', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let featuresService;

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
    usernamePasswordCredential: null,
    usernameKeyPairCredential: null,
    jsonCredential: null,
    unknownCredential: null,
  };

  hooks.beforeEach(function () {
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
    urls.usernamePasswordCredential = `${urls.credentials}/${instances.usernamePasswordCredential.id}`;
    urls.usernameKeyPairCredential = `${urls.credentials}/${instances.usernameKeyPairCredential.id}`;
    urls.jsonCredential = `${urls.credentials}/${instances.jsonCredential.id}`;
    urls.unknownCredential = `${urls.credentials}/foo`;
    authenticateSession({});
    featuresService = this.owner.lookup('service:features');
  });

  test('visiting username & password credential', async function (assert) {
    await visit(urls.staticCredentialStore);
    await click(`[href="${urls.credentials}"]`);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.credentials);
    await click(`[href="${urls.usernamePasswordCredential}"]`);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.usernamePasswordCredential);
  });

  test('visiting username & key pair credential', async function (assert) {
    await visit(urls.staticCredentialStore);
    await click(`[href="${urls.credentials}"]`);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.credentials);
    await click(`[href="${urls.usernameKeyPairCredential}"]`);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.usernameKeyPairCredential);
  });

  test('visiting JSON credential', async function (assert) {
    featuresService.enable('json-credentials');
    await visit(urls.staticCredentialStore);
    await click(`[href="${urls.credentials}"]`);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.credentials);
    await click(`[href="${urls.jsonCredential}"]`);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.jsonCredential);
  });

  test('cannot navigate to a username & password credential form without proper authorization', async function (assert) {
    instances.usernamePasswordCredential.authorized_actions =
      instances.usernamePasswordCredential.authorized_actions.filter(
        (item) => item != 'read',
      );
    await visit(urls.credentials);
    assert.dom('.rose-table-body  tr:first-child a').doesNotExist();
  });

  test('cannot navigate to a username & key pair credential form without proper authorization', async function (assert) {
    instances.usernameKeyPairCredential.authorized_actions =
      instances.usernameKeyPairCredential.authorized_actions.filter(
        (item) => item != 'read',
      );
    await visit(urls.credentials);
    assert.dom('.rose-table-body  tr:nth-child(2) a').doesNotExist();
  });

  test('cannot navigate to a JSON credential form without proper authorization', async function (assert) {
    instances.jsonCredential.authorized_actions =
      instances.jsonCredential.authorized_actions.filter(
        (item) => item != 'read',
      );
    await visit(urls.credentials);
    assert.dom('.rose-table-body  tr:nth-child(3) a').doesNotExist();
  });

  test('cannot navigate to a JSON credential form when feature not enabled', async function (assert) {
    await visit(urls.credentials);
    assert.false(featuresService.isEnabled('json-credentials'));
    assert.dom('.rose-table-body  tr:nth-child(3) a').doesNotExist();
  });

  test('visiting an unknown credential displays 404 message', async function (assert) {
    await visit(urls.unknownCredential);
    await a11yAudit();
    assert.ok(find('.rose-message-subtitle').textContent.trim(), 'Error 404');
  });

  test('Users can link to docs page for credential', async function (assert) {
    await visit(urls.usernamePasswordCredential);
    assert.ok(
      find(`[href="https://boundaryproject.io/help/admin-ui/credentials"]`),
    );
  });

  test('users can navigate to credential and incorrect url autocorrects', async function (assert) {
    const credentialStore = this.server.create('credential-store', {
      scope: instances.scopes.project,
    });
    const credential = this.server.create('credential', {
      scope: instances.scopes.project,
      credentialStore,
    });
    const incorrectUrl = `${urls.credentials}/${credential.id}`;
    const correctUrl = `${urls.projectScope}/credential-stores/${credentialStore.id}/credentials/${credential.id}`;

    await visit(incorrectUrl);

    assert.notEqual(currentURL(), incorrectUrl);
    assert.strictEqual(currentURL(), correctUrl);
  });
});
