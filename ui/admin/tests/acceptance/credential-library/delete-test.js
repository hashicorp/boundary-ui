/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { Response } from 'miragejs';
import { resolve, reject } from 'rsvp';
import sinon from 'sinon';

module('Acceptance | credential-libraries | delete', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let getCredentialLibraryCount;
  const MANAGE_DROPDOWN_SELECTOR =
    '[data-test-manage-credential-library-dropdown] button:first-child';
  const DELETE_ACTION_SELECTOR =
    '[data-test-manage-credential-library-dropdown] ul li button';

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
    // Generate resource counter
    getCredentialLibraryCount = () =>
      this.server.schema.credentialLibraries.all().models.length;
    await authenticateSession({});
  });

  test('can delete resource', async function (assert) {
    const count = getCredentialLibraryCount();
    await visit(urls.credentialLibrary);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(DELETE_ACTION_SELECTOR);
    assert.strictEqual(getCredentialLibraryCount(), count - 1);
  });

  test('cannot delete resource without proper authorization', async function (assert) {
    instances.credentialLibrary.authorized_actions =
      instances.credentialLibrary.authorized_actions.filter(
        (item) => item !== 'delete',
      );
    await visit(urls.credentialLibrary);
    assert.notOk(
      find('.rose-layout-page-actions .rose-dropdown-button-danger'),
    );
  });

  test('can accept delete credential library via dialog', async function (assert) {
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    confirmService.confirm = sinon.fake.returns(resolve());
    const count = getCredentialLibraryCount();
    await visit(urls.credentialLibrary);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(DELETE_ACTION_SELECTOR);
    assert.strictEqual(getCredentialLibraryCount(), count - 1);
    assert.ok(confirmService.confirm.calledOnce);
  });

  test('cannot cancel delete credential library via dialog', async function (assert) {
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    confirmService.confirm = sinon.fake.returns(reject());
    const count = getCredentialLibraryCount();
    await visit(urls.credentialLibrary);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(DELETE_ACTION_SELECTOR);
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
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(DELETE_ACTION_SELECTOR);
    assert
      .dom('[data-test-toast-notification] .hds-alert__description')
      .hasText('Oops.');
  });
});
