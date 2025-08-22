/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { Response } from 'miragejs';
import { resolve, reject } from 'rsvp';
import sinon from 'sinon';
import * as selectors from './selectors';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | credential-libraries | delete', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupSqlite(hooks);

  let getCredentialLibraryCount;

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
    newCredentialLibrary: null,
    unknownCredentialLibrary: null,
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
    urls.credentialStores = `/scopes/${instances.scopes.project.id}/credential-stores`;
    urls.credentialStore = `${urls.credentialStores}/${instances.credentialStore.id}`;
    urls.credentialLibraries = `${urls.credentialStore}/credential-libraries`;
    urls.credentialLibrary = `${urls.credentialLibraries}/${instances.credentialLibrary.id}`;
    urls.newCredentialLibrary = `${urls.credentialLibraries}/new`;
    urls.unknownCredentialLibrary = `${urls.credentialLibraries}/foo`;
    // Generate resource counter
    getCredentialLibraryCount = () =>
      this.server.schema.credentialLibraries.all().models.length;
    await authenticateSession({});
  });

  test('can delete resource', async function (assert) {
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
});
