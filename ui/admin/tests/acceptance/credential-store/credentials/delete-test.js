/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { click, currentURL, visit } from '@ember/test-helpers';
import { Response } from 'miragejs';
import * as selectors from './selectors';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';
import {
  TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
  TYPE_CREDENTIAL_SSH_PRIVATE_KEY,
  TYPE_CREDENTIAL_USERNAME_PASSWORD,
  TYPE_CREDENTIAL_JSON,
  TYPE_CREDENTIAL_PASSWORD,
} from 'api/models/credential';

module(
  'Acceptance | credential-stores | credentials | delete',
  function (hooks) {
    setupApplicationTest(hooks);
    setupSqlite(hooks);

    let getUsernamePasswordCredentialCount;
    let getUsernameKeyPairCredentialCount;
    let getJSONCredentialCount;
    let getUsernamePasswordDomainCredentialCount;
    let getPasswordCredentialCount;

    const mockResponseMessage = 'Oops.';
    const mockResponse = () => {
      return new Response(
        490,
        {},
        {
          status: 490,
          code: 'error',
          message: mockResponseMessage,
        },
      );
    };

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
      instances.usernamePasswordDomainCredential = this.server.create(
        'credential',
        {
          scope: instances.scopes.project,
          credentialStore: instances.staticCredentialStore,
          type: TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
        },
      );
      instances.jsonCredential = this.server.create('credential', {
        scope: instances.scopes.project,
        credentialStore: instances.staticCredentialStore,
        type: TYPE_CREDENTIAL_JSON,
      });
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
      urls.usernamePasswordDomainCredential = `${urls.credentials}/${instances.usernamePasswordDomainCredential.id}`;
      urls.jsonCredential = `${urls.credentials}/${instances.jsonCredential.id}`;
      urls.passwordCredential = `${urls.credentials}/${instances.passwordCredential.id}`;
      // Generate resource counter
      getUsernamePasswordCredentialCount = () => {
        return this.server.schema.credentials.where({
          type: TYPE_CREDENTIAL_USERNAME_PASSWORD,
        }).length;
      };
      getUsernameKeyPairCredentialCount = () => {
        return this.server.schema.credentials.where({
          type: TYPE_CREDENTIAL_SSH_PRIVATE_KEY,
        }).length;
      };
      getJSONCredentialCount = () => {
        return this.server.schema.credentials.where({ type: 'json' }).length;
      };
      getUsernamePasswordDomainCredentialCount = () => {
        return this.server.schema.credentials.where({
          type: TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
        }).length;
      };
      getPasswordCredentialCount = () => {
        return this.server.schema.credentials.where({
          type: TYPE_CREDENTIAL_PASSWORD,
        }).length;
      };
    });

    test('can delete username & password credential', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

      const usernamePasswordCredentialCount =
        getUsernamePasswordCredentialCount();
      await visit(urls.usernamePasswordCredential);

      await click(selectors.MANAGE_DROPDOWN);
      await click(selectors.MANAGE_DROPDOWN_DELETE);

      assert.strictEqual(currentURL(), urls.credentials);
      assert.strictEqual(
        getUsernamePasswordCredentialCount(),
        usernamePasswordCredentialCount - 1,
      );
    });

    test('can delete username & key pair credential', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

      const usernameKeyPairCredentialCount =
        getUsernameKeyPairCredentialCount();
      await visit(urls.usernameKeyPairCredential);

      await click(selectors.MANAGE_DROPDOWN);
      await click(selectors.MANAGE_DROPDOWN_DELETE);

      assert.strictEqual(currentURL(), urls.credentials);
      assert.strictEqual(
        getUsernameKeyPairCredentialCount(),
        usernameKeyPairCredentialCount - 1,
      );
    });

    test('can delete JSON credential', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

      const jsonCredentialCount = getJSONCredentialCount();
      await visit(urls.jsonCredential);

      await click(selectors.MANAGE_DROPDOWN);
      await click(selectors.MANAGE_DROPDOWN_DELETE);

      assert.strictEqual(currentURL(), urls.credentials);
      assert.strictEqual(getJSONCredentialCount(), jsonCredentialCount - 1);
    });

    test('can delete username, password & domain credential', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-26
            enabled: false,
          },
        },
      });

      const usernamePasswordDomainCredentialCount =
        getUsernamePasswordDomainCredentialCount();

      await visit(urls.usernamePasswordDomainCredential);

      await click(selectors.MANAGE_DROPDOWN);
      await click(selectors.MANAGE_DROPDOWN_DELETE);

      assert.strictEqual(currentURL(), urls.credentials);
      assert.strictEqual(
        getUsernamePasswordDomainCredentialCount(),
        usernamePasswordDomainCredentialCount - 1,
      );
    });

    test('can delete password credential', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-11-06
            enabled: false,
          },
        },
      });

      const passwordCredentialCount = getPasswordCredentialCount();
      await visit(urls.passwordCredential);

      await click(selectors.MANAGE_DROPDOWN);
      await click(selectors.MANAGE_DROPDOWN_DELETE);

      assert.strictEqual(currentURL(), urls.credentials);
      assert.strictEqual(
        getPasswordCredentialCount(),
        passwordCredentialCount - 1,
      );
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
      assert.dom(selectors.MANAGE_DROPDOWN).doesNotExist();
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
      assert.dom(selectors.MANAGE_DROPDOWN).doesNotExist();
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
      assert.dom(selectors.MANAGE_DROPDOWN).doesNotExist();
      assert.strictEqual(getJSONCredentialCount(), jsonCredentialCount);
    });

    test('cannot delete a username, password & domain credential without proper authorization', async function (assert) {
      const usernamePasswordDomainCredentialCount =
        getUsernamePasswordDomainCredentialCount();
      instances.usernamePasswordDomainCredential.authorized_actions =
        instances.usernamePasswordDomainCredential.authorized_actions.filter(
          (item) => item !== 'delete',
        );
      await visit(urls.usernamePasswordDomainCredential);

      assert.strictEqual(currentURL(), urls.usernamePasswordDomainCredential);
      assert.dom(selectors.MANAGE_DROPDOWN).doesNotExist();
      assert.strictEqual(
        getUsernamePasswordDomainCredentialCount(),
        usernamePasswordDomainCredentialCount,
      );
    });

    test('cannot delete a password credential without proper authorization', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-11-06
            enabled: false,
          },
        },
      });

      const passwordCredentialCount = getPasswordCredentialCount();
      instances.passwordCredential.authorized_actions =
        instances.passwordCredential.authorized_actions.filter(
          (item) => item !== 'delete',
        );
      await visit(urls.credentials);

      await click(commonSelectors.HREF(urls.passwordCredential));

      assert.strictEqual(currentURL(), urls.passwordCredential);
      assert.dom(selectors.MANAGE_DROPDOWN).doesNotExist();
      assert.strictEqual(getPasswordCredentialCount(), passwordCredentialCount);
    });

    test('can accept delete username & password credential via dialog', async function (assert) {
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
      const usernamePasswordCredentialCount =
        getUsernamePasswordCredentialCount();
      await visit(urls.usernamePasswordCredential);

      await click(selectors.MANAGE_DROPDOWN);
      await click(selectors.MANAGE_DROPDOWN_DELETE);
      await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN);
      assert.strictEqual(currentURL(), urls.credentials);
      assert.strictEqual(
        getUsernamePasswordCredentialCount(),
        usernamePasswordCredentialCount - 1,
      );
    });

    test('can accept delete username & key pair credential via dialog', async function (assert) {
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
      const usernameKeyPairCredentialCount =
        getUsernameKeyPairCredentialCount();
      await visit(urls.usernameKeyPairCredential);

      await click(selectors.MANAGE_DROPDOWN);
      await click(selectors.MANAGE_DROPDOWN_DELETE);
      await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN);

      assert.strictEqual(currentURL(), urls.credentials);
      assert.strictEqual(
        getUsernameKeyPairCredentialCount(),
        usernameKeyPairCredentialCount - 1,
      );
    });

    test('can accept delete JSON credential via dialog', async function (assert) {
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
      const jsonCredentialCount = getJSONCredentialCount();
      await visit(urls.jsonCredential);

      await click(selectors.MANAGE_DROPDOWN);
      await click(selectors.MANAGE_DROPDOWN_DELETE);
      await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN);

      assert.strictEqual(currentURL(), urls.credentials);
      assert.strictEqual(getJSONCredentialCount(), jsonCredentialCount - 1);
    });

    test('can accept delete password credential via dialog', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-11-06
            enabled: false,
          },
        },
      });

      const confirmService = this.owner.lookup('service:confirm');
      confirmService.enabled = true;
      const passwordCredentialCount = getPasswordCredentialCount();
      await visit(urls.credentials);

      await click(commonSelectors.HREF(urls.passwordCredential));
      await click(selectors.MANAGE_DROPDOWN);
      await click(selectors.MANAGE_DROPDOWN_DELETE);
      await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN);

      assert.strictEqual(currentURL(), urls.credentials);
      assert.strictEqual(
        getPasswordCredentialCount(),
        passwordCredentialCount - 1,
      );
    });

    test('can cancel delete username & password credential via dialog', async function (assert) {
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
      const usernamePasswordCredentialCount =
        getUsernamePasswordCredentialCount();
      await visit(urls.usernamePasswordCredential);

      await click(selectors.MANAGE_DROPDOWN);
      await click(selectors.MANAGE_DROPDOWN_DELETE);
      await click(commonSelectors.MODAL_WARNING_CANCEL_BTN);

      assert.strictEqual(currentURL(), urls.usernamePasswordCredential);
      assert.strictEqual(
        getUsernamePasswordCredentialCount(),
        usernamePasswordCredentialCount,
      );
    });

    test('can cancel delete username & key pair credential via dialog', async function (assert) {
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
      const usernameKeyPairCredentialCount =
        getUsernameKeyPairCredentialCount();
      await visit(urls.usernameKeyPairCredential);

      await click(selectors.MANAGE_DROPDOWN);
      await click(selectors.MANAGE_DROPDOWN_DELETE);
      await click(commonSelectors.MODAL_WARNING_CANCEL_BTN);

      assert.strictEqual(currentURL(), urls.usernameKeyPairCredential);
      assert.strictEqual(
        getUsernameKeyPairCredentialCount(),
        usernameKeyPairCredentialCount,
      );
    });

    test('can cancel delete username, password & domain credential via dialog', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-26
            enabled: false,
          },
        },
      });

      const confirmService = this.owner.lookup('service:confirm');
      confirmService.enabled = true;
      const usernamePasswordDomainCredentialCount =
        getUsernamePasswordDomainCredentialCount();
      await visit(urls.usernamePasswordDomainCredential);

      await click(selectors.MANAGE_DROPDOWN);
      await click(selectors.MANAGE_DROPDOWN_DELETE);
      await click(commonSelectors.MODAL_WARNING_CANCEL_BTN);

      assert.strictEqual(currentURL(), urls.usernamePasswordDomainCredential);
      assert.strictEqual(
        getUsernamePasswordDomainCredentialCount(),
        usernamePasswordDomainCredentialCount,
      );
    });

    test('can cancel delete JSON credential via dialog', async function (assert) {
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
      const jsonCredentialCount = getJSONCredentialCount();
      await visit(urls.jsonCredential);

      await click(selectors.MANAGE_DROPDOWN);
      await click(selectors.MANAGE_DROPDOWN_DELETE);
      await click(commonSelectors.MODAL_WARNING_CANCEL_BTN);

      assert.strictEqual(currentURL(), urls.jsonCredential);
      assert.strictEqual(getJSONCredentialCount(), jsonCredentialCount);
    });

    test('can cancel delete password credential via dialog', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-11-06
            enabled: false,
          },
        },
      });

      const confirmService = this.owner.lookup('service:confirm');
      confirmService.enabled = true;
      const passwordCredentialCount = getPasswordCredentialCount();
      await visit(urls.credentials);

      await click(commonSelectors.HREF(urls.passwordCredential));
      await click(selectors.MANAGE_DROPDOWN);
      await click(selectors.MANAGE_DROPDOWN_DELETE);
      await click(commonSelectors.MODAL_WARNING_CANCEL_BTN);

      assert.strictEqual(currentURL(), urls.passwordCredential);
      assert.strictEqual(getPasswordCredentialCount(), passwordCredentialCount);
    });

    test('deleting a username & password credential which errors displays error message', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

      this.server.del('/credentials/:id', mockResponse);
      await visit(urls.usernamePasswordCredential);

      await click(selectors.MANAGE_DROPDOWN);
      await click(selectors.MANAGE_DROPDOWN_DELETE);

      assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText(mockResponseMessage);
    });

    test('deleting a username & key pair credential which errors displays error message', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

      this.server.del('/credentials/:id', mockResponse);
      await visit(urls.usernameKeyPairCredential);

      await click(selectors.MANAGE_DROPDOWN);
      await click(selectors.MANAGE_DROPDOWN_DELETE);

      assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText(mockResponseMessage);
    });

    test('deleting a JSON credential which errors displays error message', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

      this.server.del('/credentials/:id', mockResponse);
      await visit(urls.jsonCredential);

      await click(selectors.MANAGE_DROPDOWN);
      await click(selectors.MANAGE_DROPDOWN_DELETE);

      assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText(mockResponseMessage);
    });

    test('deleting a username, password & domain credential which errors displays error message', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-26
            enabled: false,
          },
        },
      });

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
      await visit(urls.usernamePasswordDomainCredential);

      await click(selectors.MANAGE_DROPDOWN);
      await click(selectors.MANAGE_DROPDOWN_DELETE);

      assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText('Oops.');
    });

    test('deleting a password credential which errors displays error message', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-11-06
            enabled: false,
          },
        },
      });

      this.server.del('/credentials/:id', mockResponse);
      await visit(urls.passwordCredential);

      await click(selectors.MANAGE_DROPDOWN);
      await click(selectors.MANAGE_DROPDOWN_DELETE);

      assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText(mockResponseMessage);
    });
  },
);
