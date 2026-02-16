/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { click, currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | credential-stores | read', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  let featuresService;

  const instances = {
    scopes: {
      org: null,
      project: null,
    },
    staticCredentialStore: null,
    vaultCredentialStore: null,
  };

  const urls = {
    projectScope: null,
    credentialStores: null,
    staticCredentialStore: null,
    vaultCredentialStore: null,
    unknownCredentialStore: null,
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
    instances.vaultCredentialStore = this.server.create('credential-store', {
      scope: instances.scopes.project,
      type: 'vault',
    });
    // Generate route URLs for resources
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.credentialStores = `${urls.projectScope}/credential-stores`;
    urls.staticCredentialStore = `${urls.credentialStores}/${instances.staticCredentialStore.id}`;
    urls.vaultCredentialStore = `${urls.credentialStores}/${instances.vaultCredentialStore.id}`;
    urls.unknownCredentialStore = `${urls.credentialStores}/foo`;

    featuresService = this.owner.lookup('service:features');
  });

  test('visiting static credential store', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    featuresService.enable('static-credentials');
    await visit(urls.credentialStores);

    assert.strictEqual(currentURL(), urls.credentialStores);

    await click(commonSelectors.HREF(urls.staticCredentialStore));

    assert.strictEqual(currentURL(), urls.staticCredentialStore);
  });

  test('visiting vault credential store', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.credentialStores);

    assert.strictEqual(currentURL(), urls.credentialStores);

    await click(commonSelectors.HREF(urls.vaultCredentialStore));

    assert.strictEqual(currentURL(), urls.vaultCredentialStore);
  });

  test('cannot navigate to a static credential store form without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.projectScope);
    instances.staticCredentialStore.authorized_actions =
      instances.staticCredentialStore.authorized_actions.filter(
        (item) => item !== 'read',
      );

    await click(commonSelectors.HREF(urls.credentialStores));

    assert
      .dom(commonSelectors.TABLE_RESOURCE_LINK(urls.vaultCredentialStore))
      .isVisible();
    assert
      .dom(commonSelectors.TABLE_RESOURCE_LINK(urls.staticCredentialStore))
      .doesNotExist();
  });

  test('cannot navigate to a vault credential store form without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    featuresService.enable('static-credentials');
    await visit(urls.projectScope);
    instances.vaultCredentialStore.authorized_actions =
      instances.vaultCredentialStore.authorized_actions.filter(
        (item) => item !== 'read',
      );

    await click(commonSelectors.HREF(urls.credentialStores));

    assert
      .dom(commonSelectors.TABLE_RESOURCE_LINK(urls.staticCredentialStore))
      .isVisible();
    assert
      .dom(commonSelectors.TABLE_RESOURCE_LINK(urls.vaultCredentialStore))
      .doesNotExist();
  });

  test('visiting an unknown credential store displays 404 message', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.unknownCredentialStore);

    assert
      .dom(commonSelectors.RESOURCE_NOT_FOUND_SUBTITLE)
      .hasText(commonSelectors.RESOURCE_NOT_FOUND_VALUE);
  });

  test('users can link to docs page for credential store', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.projectScope);

    await click(commonSelectors.HREF(urls.credentialStores));

    assert
      .dom(
        commonSelectors.HREF(
          'https://developer.hashicorp.com/boundary/docs/concepts/domain-model/credential-stores',
        ),
      )
      .isVisible();
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
