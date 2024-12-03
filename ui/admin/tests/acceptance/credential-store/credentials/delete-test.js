/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { click, currentURL, visit } from '@ember/test-helpers';
import { Response } from 'miragejs';

module(
  'Acceptance | credential-stores | credentials | delete',
  function (hooks) {
    setupApplicationTest(hooks);
    setupMirage(hooks);

    let getUsernamePasswordCredentialCount;
    let getUsernameKeyPairCredentialCount;
    let getJSONCredentialCount;

    const MANAGE_DROPDOWN_SELECTOR =
      '[data-test-manage-credentials-dropdown] button:first-child';
    const DELETE_ACTION_SELECTOR =
      '[data-test-manage-credentials-dropdown] ul li button';

    const instances = {
      scopes: {
        org: null,
        project: null,
      },
    };

    const urls = {
      projectScope: null,
      credentialStores: null,
      staticCredentialStore: null,
      credentials: null,
      usernamePasswordCredential: null,
      usernameKeyPairCredential: null,
      jsonCredential: null,
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
      urls.usernamePasswordCredential = `${urls.credentials}/${instances.usernamePasswordCredential.id}`;
      urls.usernameKeyPairCredential = `${urls.credentials}/${instances.usernameKeyPairCredential.id}`;
      urls.jsonCredential = `${urls.credentials}/${instances.jsonCredential.id}`;
      // Generate resource counter
      getUsernamePasswordCredentialCount = () => {
        return this.server.schema.credentials.where({
          type: 'username_password',
        }).length;
      };
      getUsernameKeyPairCredentialCount = () => {
        return this.server.schema.credentials.where({ type: 'ssh_private_key' })
          .length;
      };
      getJSONCredentialCount = () => {
        return this.server.schema.credentials.where({ type: 'json' }).length;
      };
      await authenticateSession({});
    });

    test('can delete username & password credential', async function (assert) {
      const usernamePasswordCredentialCount =
        getUsernamePasswordCredentialCount();
      await visit(urls.usernamePasswordCredential);
      await click(MANAGE_DROPDOWN_SELECTOR);
      await click(DELETE_ACTION_SELECTOR);
      assert.strictEqual(currentURL(), urls.credentials);
      assert.strictEqual(
        getUsernamePasswordCredentialCount(),
        usernamePasswordCredentialCount - 1,
      );
    });

    test('can delete username & key pair credential', async function (assert) {
      const usernameKeyPairCredentialCount =
        getUsernameKeyPairCredentialCount();
      await visit(urls.usernameKeyPairCredential);
      await click(MANAGE_DROPDOWN_SELECTOR);
      await click(DELETE_ACTION_SELECTOR);
      assert.strictEqual(currentURL(), urls.credentials);
      assert.strictEqual(
        getUsernameKeyPairCredentialCount(),
        usernameKeyPairCredentialCount - 1,
      );
    });

    test('can delete JSON credential', async function (assert) {
      const jsonCredentialCount = getJSONCredentialCount();
      await visit(urls.jsonCredential);
      await click(MANAGE_DROPDOWN_SELECTOR);
      await click(DELETE_ACTION_SELECTOR);
      assert.strictEqual(currentURL(), urls.credentials);
      assert.strictEqual(getJSONCredentialCount(), jsonCredentialCount - 1);
    });

    test('cannot delete a username & password credential without proper authorization', async function (assert) {
      const usernamePasswordCredentialCount =
        getUsernamePasswordCredentialCount();
      instances.usernamePasswordCredential.authorized_actions =
        instances.usernamePasswordCredential.authorized_actions.filter(
          (item) => item !== 'delete',
        );
      await visit(urls.usernamePasswordCredential);
      assert.strictEqual(currentURL(), urls.usernamePasswordCredential);
      assert.dom(MANAGE_DROPDOWN_SELECTOR).doesNotExist();
      assert.strictEqual(
        getUsernamePasswordCredentialCount(),
        usernamePasswordCredentialCount,
      );
    });

    test('cannot delete a username & key pair credential without proper authorization', async function (assert) {
      const usernameKeyPairCredentialCount =
        getUsernameKeyPairCredentialCount();
      instances.usernameKeyPairCredential.authorized_actions =
        instances.usernameKeyPairCredential.authorized_actions.filter(
          (item) => item !== 'delete',
        );
      await visit(urls.usernameKeyPairCredential);
      assert.strictEqual(currentURL(), urls.usernameKeyPairCredential);
      assert.dom(MANAGE_DROPDOWN_SELECTOR).doesNotExist();
      assert.strictEqual(
        getUsernamePasswordCredentialCount(),
        usernameKeyPairCredentialCount,
      );
    });

    test('cannot delete a JSON credential without proper authorization', async function (assert) {
      const jsonCredentialCount = getJSONCredentialCount();
      instances.jsonCredential.authorized_actions =
        instances.jsonCredential.authorized_actions.filter(
          (item) => item !== 'delete',
        );
      await visit(urls.jsonCredential);
      assert.strictEqual(currentURL(), urls.jsonCredential);
      assert.dom(MANAGE_DROPDOWN_SELECTOR).doesNotExist();
      assert.strictEqual(getJSONCredentialCount(), jsonCredentialCount);
    });

    test('can accept delete username & password credential via dialog', async function (assert) {
      const confirmService = this.owner.lookup('service:confirm');
      confirmService.enabled = true;
      const usernamePasswordCredentialCount =
        getUsernamePasswordCredentialCount();
      await visit(urls.usernamePasswordCredential);
      await click(MANAGE_DROPDOWN_SELECTOR);
      await click(DELETE_ACTION_SELECTOR);
      await click('.rose-dialog footer .rose-button-primary');
      assert.strictEqual(currentURL(), urls.credentials);
      assert.strictEqual(
        getUsernamePasswordCredentialCount(),
        usernamePasswordCredentialCount - 1,
      );
    });

    test('can accept delete username & key pair credential via dialog', async function (assert) {
      const confirmService = this.owner.lookup('service:confirm');
      confirmService.enabled = true;
      const usernameKeyPairCredentialCount =
        getUsernameKeyPairCredentialCount();
      await visit(urls.usernameKeyPairCredential);
      await click(MANAGE_DROPDOWN_SELECTOR);
      await click(DELETE_ACTION_SELECTOR);
      await click('.rose-dialog footer .rose-button-primary');
      assert.strictEqual(currentURL(), urls.credentials);
      assert.strictEqual(
        getUsernameKeyPairCredentialCount(),
        usernameKeyPairCredentialCount - 1,
      );
    });

    test('can accept delete JSON credential via dialog', async function (assert) {
      const confirmService = this.owner.lookup('service:confirm');
      confirmService.enabled = true;
      const jsonCredentialCount = getJSONCredentialCount();
      await visit(urls.jsonCredential);
      await click(MANAGE_DROPDOWN_SELECTOR);
      await click(DELETE_ACTION_SELECTOR);
      await click('.rose-dialog footer .rose-button-primary');
      assert.strictEqual(currentURL(), urls.credentials);
      assert.strictEqual(getJSONCredentialCount(), jsonCredentialCount - 1);
    });

    test('can cancel delete username & password credential via dialog', async function (assert) {
      const confirmService = this.owner.lookup('service:confirm');
      confirmService.enabled = true;
      const usernamePasswordCredentialCount =
        getUsernamePasswordCredentialCount();
      await visit(urls.usernamePasswordCredential);
      await click(MANAGE_DROPDOWN_SELECTOR);
      await click(DELETE_ACTION_SELECTOR);
      await click('.rose-dialog footer .rose-button-secondary');
      assert.strictEqual(currentURL(), urls.usernamePasswordCredential);
      assert.strictEqual(
        getUsernamePasswordCredentialCount(),
        usernamePasswordCredentialCount,
      );
    });

    test('can cancel delete username & key pair credential via dialog', async function (assert) {
      const confirmService = this.owner.lookup('service:confirm');
      confirmService.enabled = true;
      const usernameKeyPairCredentialCount =
        getUsernameKeyPairCredentialCount();
      await visit(urls.usernameKeyPairCredential);
      await click(MANAGE_DROPDOWN_SELECTOR);
      await click(DELETE_ACTION_SELECTOR);
      await click('.rose-dialog footer .rose-button-secondary');
      assert.strictEqual(currentURL(), urls.usernameKeyPairCredential);
      assert.strictEqual(
        getUsernameKeyPairCredentialCount(),
        usernameKeyPairCredentialCount,
      );
    });

    test('can cancel delete JSON credential via dialog', async function (assert) {
      const confirmService = this.owner.lookup('service:confirm');
      confirmService.enabled = true;
      const jsonCredentialCount = getJSONCredentialCount();
      await visit(urls.jsonCredential);
      await click(MANAGE_DROPDOWN_SELECTOR);
      await click(DELETE_ACTION_SELECTOR);
      await click('.rose-dialog footer .rose-button-secondary');
      assert.strictEqual(currentURL(), urls.jsonCredential);
      assert.strictEqual(getJSONCredentialCount(), jsonCredentialCount);
    });

    test('deleting a username & password credential which errors displays error message', async function (assert) {
      this.server.del('/credentials/:id', () => {
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
      await visit(urls.usernamePasswordCredential);
      await click(MANAGE_DROPDOWN_SELECTOR);
      await click(DELETE_ACTION_SELECTOR);
      assert
        .dom('[data-test-toast-notification] .hds-alert__description')
        .hasText('Oops.');
    });

    test('deleting a username & key pair credential which errors displays error message', async function (assert) {
      this.server.del('/credentials/:id', () => {
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
      await visit(urls.usernameKeyPairCredential);
      await click(MANAGE_DROPDOWN_SELECTOR);
      await click(DELETE_ACTION_SELECTOR);
      assert
        .dom('[data-test-toast-notification] .hds-alert__description')
        .hasText('Oops.');
    });

    test('deleting a JSON credential which errors displays error message', async function (assert) {
      this.server.del('/credentials/:id', () => {
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
      await visit(urls.jsonCredential);
      await click(MANAGE_DROPDOWN_SELECTOR);
      await click(DELETE_ACTION_SELECTOR);
      assert
        .dom('[data-test-toast-notification] .hds-alert__description')
        .hasText('Oops.');
    });
  },
);
