/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { Response } from 'miragejs';
import { resolve, reject } from 'rsvp';
import sinon from 'sinon';
import * as selectors from './selectors';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';
import {
  TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
  TYPE_CREDENTIAL_LIBRARY_VAULT_LDAP,
} from 'api/models/credential-library';
import { TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN } from 'api/models/credential';

module('Acceptance | credential-libraries | delete', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  let getCredentialLibraryCount;
  let getUsernamePasswordDomainCredentialLibraryCount;
  let getVaultLDAPCredentialLibraryCount;

  const instances = {
    scopes: {
      org: null,
      project: null,
    },
  };

  const urls = {
    credentialStores: null,
    credentialStore: null,
    credentialLibrary: null,
    credentialLibraries: null,
    newCredentialLibrary: null,
    unknownCredentialLibrary: null,
    usernamePasswordDomainCredentialLibrary: null,
    vaultLDAPCredentialLibrary: null,
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
    instances.credentialStore = this.server.create('credential-store', {
      scope: instances.scopes.project,
    });
    instances.credentialLibrary = this.server.create('credential-library', {
      scope: instances.scopes.project,
      credentialStore: instances.credentialStore,
    });
    instances.usernamePasswordDomainCredentialLibrary = this.server.create(
      'credential-library',
      {
        scope: instances.scopes.project,
        credentialStore: instances.credentialStore,
        type: TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
        credential_type: TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
      },
    );
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
    urls.credentialLibrary = `${urls.credentialLibraries}/${instances.credentialLibrary.id}`;
    urls.newCredentialLibrary = `${urls.credentialLibraries}/new`;
    urls.unknownCredentialLibrary = `${urls.credentialLibraries}/foo`;
    urls.usernamePasswordDomainCredentialLibrary = `${urls.credentialLibraries}/${instances.usernamePasswordDomainCredentialLibrary.id}`;
    urls.vaultLDAPCredentialLibrary = `${urls.credentialLibraries}/${instances.vaultLDAPCredentialLibrary.id}`;
    // Generate resource counter
    getCredentialLibraryCount = () =>
      this.server.schema.credentialLibraries.all().models.length;
    getUsernamePasswordDomainCredentialLibraryCount = () => {
      return this.server.schema.credentialLibraries.where({
        credential_type: TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
      }).length;
    };
    getVaultLDAPCredentialLibraryCount = () => {
      return this.server.schema.credentialLibraries.where({
        type: TYPE_CREDENTIAL_LIBRARY_VAULT_LDAP,
      }).length;
    };
  });

  test('can delete resource', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const count = getCredentialLibraryCount();
    await visit(urls.credentialLibrary);

    await click(selectors.MANAGE_DROPDOWN_CRED_LIB);
    await click(selectors.MANAGE_DROPDOWN_CRED_LIB_DELETE);

    assert.strictEqual(getCredentialLibraryCount(), count - 1);
  });

  test('cannot delete resource without proper authorization', async function (assert) {
    instances.credentialLibrary.authorized_actions =
      instances.credentialLibrary.authorized_actions.filter(
        (item) => item !== 'delete',
      );

    await visit(urls.credentialLibrary);

    assert.dom(selectors.MANAGE_DROPDOWN_CRED_LIB).doesNotExist();
  });

  test('can accept delete credential library via dialog', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    confirmService.confirm = sinon.fake.returns(resolve());
    const count = getCredentialLibraryCount();
    await visit(urls.credentialLibrary);

    await click(selectors.MANAGE_DROPDOWN_CRED_LIB);
    await click(selectors.MANAGE_DROPDOWN_CRED_LIB_DELETE);

    assert.strictEqual(getCredentialLibraryCount(), count - 1);
    assert.ok(confirmService.confirm.calledOnce);
  });

  test('cannot cancel delete credential library via dialog', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    confirmService.confirm = sinon.fake.returns(reject());
    const count = getCredentialLibraryCount();
    await visit(urls.credentialLibrary);

    await click(selectors.MANAGE_DROPDOWN_CRED_LIB);
    await click(selectors.MANAGE_DROPDOWN_CRED_LIB_DELETE);

    assert.strictEqual(getCredentialLibraryCount(), count);
    assert.ok(confirmService.confirm.calledOnce);
  });

  test('deleting a credential library which errors displays error messages', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    this.server.del('/credential-libraries/:id', () => {
      return new Response(
        490,
        {},
        {
          status: 490,
          code: 'error',
          message: 'Oops.',
        },
      );
    });
    await visit(urls.credentialLibrary);

    await click(selectors.MANAGE_DROPDOWN_CRED_LIB);
    await click(selectors.MANAGE_DROPDOWN_CRED_LIB_DELETE);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText('Oops.');
  });

  test('can delete username password and domain credential library type', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-26
          enabled: false,
        },
      },
    });

    const usernamePasswordDomainCredentialLibraryCount =
      getUsernamePasswordDomainCredentialLibraryCount();
    await visit(urls.usernamePasswordDomainCredentialLibrary);

    await click(selectors.MANAGE_DROPDOWN_CRED_LIB);
    await click(selectors.MANAGE_DROPDOWN_CRED_LIB_DELETE);

    assert.strictEqual(
      getUsernamePasswordDomainCredentialLibraryCount(),
      usernamePasswordDomainCredentialLibraryCount - 1,
    );
  });

  test('can delete vault ldap credential library type', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-26
          enabled: false,
        },
      },
    });

    const vaultLDAPCredentialLibraryCount =
      getVaultLDAPCredentialLibraryCount();
    await visit(urls.vaultLDAPCredentialLibrary);

    await click(selectors.MANAGE_DROPDOWN_CRED_LIB);
    await click(selectors.MANAGE_DROPDOWN_CRED_LIB_DELETE);

    assert.strictEqual(
      getVaultLDAPCredentialLibraryCount(),
      vaultLDAPCredentialLibraryCount - 1,
    );
  });
});
