/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, find, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';
import {
  TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
  TYPE_CREDENTIAL_SSH_PRIVATE_KEY,
  TYPE_CREDENTIAL_USERNAME_PASSWORD,
  TYPE_CREDENTIAL_JSON,
  TYPE_CREDENTIAL_PASSWORD,
} from 'api/models/credential';

module('Acceptance | credential-stores | credentials | read', function (hooks) {
  setupApplicationTest(hooks);
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
    usernamePasswordDomainCredential: null,
    passwordCredential: null,
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
    usernamePasswordDomainCredential: null,
    passwordCredential: null,
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
      type: TYPE_CREDENTIAL_USERNAME_PASSWORD,
    });
    instances.usernameKeyPairCredential = this.server.create('credential', {
      scope: instances.scopes.project,
      credentialStore: instances.staticCredentialStore,
      type: TYPE_CREDENTIAL_SSH_PRIVATE_KEY,
    });
    instances.jsonCredential = this.server.create('credential', {
      scope: instances.scopes.project,
      credentialStore: instances.staticCredentialStore,
      type: TYPE_CREDENTIAL_JSON,
    });
    instances.usernamePasswordDomainCredential = this.server.create(
      'credential',
      {
        scope: instances.scopes.project,
        credentialStore: instances.staticCredentialStore,
        type: TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
      },
    );
    instances.passwordCredential = this.server.create('credential', {
      scope: instances.scopes.project,
      credentialStore: instances.staticCredentialStore,
      type: TYPE_CREDENTIAL_PASSWORD,
    });

    // Generate route URLs for resources
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.credentialStores = `${urls.projectScope}/credential-stores`;
    urls.staticCredentialStore = `${urls.credentialStores}/${instances.staticCredentialStore.id}`;
    urls.credentials = `${urls.staticCredentialStore}/credentials`;
    urls.usernamePasswordCredential = `${urls.credentials}/${instances.usernamePasswordCredential.id}`;
    urls.usernameKeyPairCredential = `${urls.credentials}/${instances.usernameKeyPairCredential.id}`;
    urls.jsonCredential = `${urls.credentials}/${instances.jsonCredential.id}`;
    urls.usernamePasswordDomainCredential = `${urls.credentials}/${instances.usernamePasswordDomainCredential.id}`;
    urls.passwordCredential = `${urls.credentials}/${instances.passwordCredential.id}`;
    urls.unknownCredential = `${urls.credentials}/foo`;
  });

  test('visiting username & password credential', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.staticCredentialStore);
    await click(commonSelectors.HREF(urls.credentials));

    assert.strictEqual(currentURL(), urls.credentials);

    await click(commonSelectors.HREF(urls.usernamePasswordCredential));

    assert.strictEqual(currentURL(), urls.usernamePasswordCredential);
  });

  test('visiting username & key pair credential', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.staticCredentialStore);
    await click(commonSelectors.HREF(urls.credentials));

    assert.strictEqual(currentURL(), urls.credentials);

    await click(commonSelectors.HREF(urls.usernameKeyPairCredential));

    assert.strictEqual(currentURL(), urls.usernameKeyPairCredential);
  });

  test('visiting JSON credential', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.staticCredentialStore);
    await click(commonSelectors.HREF(urls.credentials));

    assert.strictEqual(currentURL(), urls.credentials);

    await click(commonSelectors.HREF(urls.jsonCredential));

    assert.strictEqual(currentURL(), urls.jsonCredential);
  });

  test('visiting username, password & domain credential', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-26
          enabled: false,
        },
      },
    });

    await visit(urls.staticCredentialStore);

    await click(commonSelectors.HREF(urls.credentials));

    assert.strictEqual(currentURL(), urls.credentials);

    await click(commonSelectors.HREF(urls.usernamePasswordDomainCredential));

    assert.strictEqual(currentURL(), urls.usernamePasswordDomainCredential);
  });

  test('visiting password credential', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-11-06
          enabled: false,
        },
      },
    });

    await visit(urls.staticCredentialStore);
    await click(commonSelectors.HREF(urls.credentials));

    assert.strictEqual(currentURL(), urls.credentials);

    await click(commonSelectors.HREF(urls.passwordCredential));

    assert.strictEqual(currentURL(), urls.passwordCredential);
  });

  test('cannot navigate to a username & password credential form without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.usernamePasswordCredential.authorized_actions =
      instances.usernamePasswordCredential.authorized_actions.filter(
        (item) => item != 'read',
      );
    await visit(urls.credentials);

    assert
      .dom(commonSelectors.TABLE_RESOURCE_LINK(urls.usernameKeyPairCredential))
      .isVisible();
    assert
      .dom(commonSelectors.TABLE_RESOURCE_LINK(urls.usernamePasswordCredential))
      .doesNotExist();
  });

  test('cannot navigate to a username & key pair credential form without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.usernameKeyPairCredential.authorized_actions =
      instances.usernameKeyPairCredential.authorized_actions.filter(
        (item) => item != 'read',
      );
    await visit(urls.credentials);

    assert
      .dom(commonSelectors.TABLE_RESOURCE_LINK(urls.usernamePasswordCredential))
      .isVisible();
    assert
      .dom(commonSelectors.TABLE_RESOURCE_LINK(urls.usernameKeyPairCredential))
      .doesNotExist();
  });

  test('cannot navigate to a JSON credential form without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.jsonCredential.authorized_actions =
      instances.jsonCredential.authorized_actions.filter(
        (item) => item != 'read',
      );
    await visit(urls.credentials);

    assert
      .dom(commonSelectors.TABLE_RESOURCE_LINK(urls.usernamePasswordCredential))
      .isVisible();
    assert
      .dom(commonSelectors.TABLE_RESOURCE_LINK(urls.jsonCredential))
      .doesNotExist();
  });

  test('cannot navigate to a username, password & domain credential form without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-26
          enabled: false,
        },
      },
    });

    instances.usernamePasswordDomainCredential.authorized_actions =
      instances.usernamePasswordDomainCredential.authorized_actions.filter(
        (item) => item != 'read',
      );
    await visit(urls.credentials);

    assert
      .dom(
        commonSelectors.TABLE_RESOURCE_LINK(
          urls.usernamePasswordDomainCredential,
        ),
      )
      .doesNotExist();
  });

  test('cannot navigate to a password credential form without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-11-06
          enabled: false,
        },
      },
    });

    instances.passwordCredential.authorized_actions =
      instances.passwordCredential.authorized_actions.filter(
        (item) => item != 'read',
      );
    await visit(urls.credentials);

    assert
      .dom(commonSelectors.TABLE_RESOURCE_LINK(urls.usernamePasswordCredential))
      .isVisible();
    assert
      .dom(commonSelectors.TABLE_RESOURCE_LINK(urls.passwordCredential))
      .doesNotExist();
  });

  test('visiting an unknown credential displays 404 message', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.unknownCredential);

    assert
      .dom(commonSelectors.RESOURCE_NOT_FOUND_SUBTITLE)
      .hasText(commonSelectors.RESOURCE_NOT_FOUND_VALUE);
  });

  test('Users can link to docs page for credential', async function (assert) {
    await visit(urls.usernamePasswordCredential);

    assert.ok(
      find(
        `[href="https://developer.hashicorp.com/boundary/docs/concepts/domain-model/credentials"]`,
      ),
    );
  });

  test('users can navigate to credential and incorrect url auto-corrects', async function (assert) {
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
