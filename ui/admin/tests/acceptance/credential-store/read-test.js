/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | credential-stores | read', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  let featuresService;

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
    globalScope: null,
    orgScope: null,
    projectScope: null,
    credentialStores: null,
    staticCredentialStore: null,
    vaultCredentialStore: null,
    unknownCredentialStore: null,
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
    instances.staticCredentialStore = this.server.create('credential-store', {
      scope: instances.scopes.project,
      type: 'static',
    });
    instances.vaultCredentialStore = this.server.create('credential-store', {
      scope: instances.scopes.project,
      type: 'vault',
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.credentialStores = `${urls.projectScope}/credential-stores`;
    urls.staticCredentialStore = `${urls.credentialStores}/${instances.staticCredentialStore.id}`;
    urls.vaultCredentialStore = `${urls.credentialStores}/${instances.vaultCredentialStore.id}`;
    urls.unknownCredentialStore = `${urls.credentialStores}/foo`;

    await authenticateSession({ username: 'admin' });
    featuresService = this.owner.lookup('service:features');
  });

  test('visiting static credential store', async function (assert) {
    featuresService.enable('static-credentials');
    await visit(urls.credentialStores);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.credentialStores);

    await click(`[href="${urls.staticCredentialStore}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.staticCredentialStore);
  });

  test('visiting vault credential store', async function (assert) {
    await visit(urls.credentialStores);
    assert.strictEqual(currentURL(), urls.credentialStores);

    await click(`[href="${urls.vaultCredentialStore}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.vaultCredentialStore);
  });

  test('cannot navigate to a static credential store form without proper authorization', async function (assert) {
    await visit(urls.projectScope);
    instances.staticCredentialStore.authorized_actions =
      instances.staticCredentialStore.authorized_actions.filter(
        (item) => item !== 'read',
      );

    await click(`[href="${urls.credentialStores}"]`);

    assert
      .dom(commonSelectors.TABLE_RESOURCE_LINK(urls.vaultCredentialStore))
      .isVisible();
    assert
      .dom(commonSelectors.TABLE_RESOURCE_LINK(urls.staticCredentialStore))
      .doesNotExist();
  });

  test('cannot navigate to a vault credential store form without proper authorization', async function (assert) {
    featuresService.enable('static-credentials');
    await visit(urls.projectScope);
    instances.vaultCredentialStore.authorized_actions =
      instances.vaultCredentialStore.authorized_actions.filter(
        (item) => item !== 'read',
      );

    await click(`[href="${urls.credentialStores}"]`);

    assert
      .dom(commonSelectors.TABLE_RESOURCE_LINK(urls.staticCredentialStore))
      .isVisible();
    assert
      .dom(commonSelectors.TABLE_RESOURCE_LINK(urls.vaultCredentialStore))
      .doesNotExist();
  });

  test('visiting an unknown credential store displays 404 message', async function (assert) {
    await visit(urls.unknownCredentialStore);
    await a11yAudit();

    assert.dom('.rose-message-subtitle').hasText('Error 404');
  });

  test('users can link to docs page for credential store', async function (assert) {
    await visit(urls.projectScope);

    await click(`[href="${urls.credentialStores}"]`);

    assert
      .dom(
        `[href="https://developer.hashicorp.com/boundary/docs/concepts/domain-model/credential-stores"]`,
      )
      .exists();
  });

  test('users can navigate to credential store and incorrect url auto-corrects', async function (assert) {
    const projectScope = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    const credentialStore = this.server.create('credential-store', {
      scope: projectScope,
    });
    const incorrectUrl = `${urls.credentialStores}/${credentialStore.id}/credentials`;
    const correctUrl = `/scopes/${projectScope.id}/credential-stores/${credentialStore.id}/credentials`;

    await visit(incorrectUrl);

    assert.notEqual(currentURL(), incorrectUrl);
    assert.strictEqual(currentURL(), correctUrl);
  });
});
