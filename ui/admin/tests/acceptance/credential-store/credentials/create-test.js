/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { Response } from 'miragejs';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module(
  'Acceptance | credential-stores | credentials | create',
  function (hooks) {
    setupApplicationTest(hooks);
    setupMirage(hooks);
    setupIndexedDb(hooks);

    let getCredentialsCount;
    let getUsernamePasswordCredentialCount;
    let getUsernameKeyPairCredentialCount;
    let getJsonCredentialCount;
    let featuresService;

    const instances = {
      scopes: {
        org: null,
        project: null,
      },
      staticCredentialStore: null,
    };

    const urls = {
      projectScope: null,
      credentialStores: null,
      staticCredentialStore: null,
      credentials: null,
      newCredential: null,
    };

    hooks.beforeEach(async function () {
      // Generate resources
      featuresService = this.owner.lookup('service:features');
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
      // Generate route URLs for resources
      urls.projectScope = `/scopes/${instances.scopes.project.id}`;
      urls.credentialStores = `${urls.projectScope}/credential-stores`;
      urls.staticCredentialStore = `${urls.credentialStores}/${instances.staticCredentialStore.id}`;
      urls.credentials = `${urls.staticCredentialStore}/credentials`;
      urls.newCredential = `${urls.credentials}/new`;
      // Generate resource counter
      getCredentialsCount = () => {
        return this.server.schema.credentials.all().models.length;
      };
      getUsernamePasswordCredentialCount = () => {
        return this.server.schema.credentials.where({
          type: 'username_password',
        }).length;
      };
      getUsernameKeyPairCredentialCount = () => {
        return this.server.schema.credentials.where({ type: 'ssh_private_key' })
          .length;
      };
      getJsonCredentialCount = () => {
        return this.server.schema.credentials.where({ type: 'json' }).length;
      };
      await authenticateSession({});
    });

    test('users can create a new username & password credential', async function (assert) {
      const credentialsCount = getCredentialsCount();
      const usernamePasswordCredentialCount =
        getUsernamePasswordCredentialCount();
      await visit(urls.credentials);

      await click(`[href="${urls.newCredential}"]`);
      await fillIn('[name="name"]', 'random string');
      await click('[type="submit"]');

      assert.strictEqual(getCredentialsCount(), credentialsCount + 1);
      assert.strictEqual(
        getUsernamePasswordCredentialCount(),
        usernamePasswordCredentialCount + 1,
      );
    });

    test('users can create a new username & key pair credential', async function (assert) {
      const credentialsCount = getCredentialsCount();
      const usernameKeyPairCredentialCount =
        getUsernameKeyPairCredentialCount();
      await visit(urls.credentials);

      await click(`[href="${urls.newCredential}"]`);
      await fillIn('[name="name"]', 'random string');
      await click('[value="ssh_private_key"]');
      await click('[type="submit"]');

      assert.strictEqual(getCredentialsCount(), credentialsCount + 1);
      assert.strictEqual(
        getUsernameKeyPairCredentialCount(),
        usernameKeyPairCredentialCount + 1,
      );
    });

    test('users can create a new json credential', async function (assert) {
      featuresService.enable('json-credentials');
      const credentialsCount = getCredentialsCount();
      const jsonCredentialCount = getJsonCredentialCount();
      await visit(urls.credentials);

      await click(`[href="${urls.newCredential}"]`);
      await fillIn('[name="name"]', 'random string');
      await click('[value="json"]');
      await click('[type="submit"]');

      assert.strictEqual(getCredentialsCount(), credentialsCount + 1);
      assert.strictEqual(getJsonCredentialCount(), jsonCredentialCount + 1);
    });

    test('users can cancel create new username & password credential', async function (assert) {
      const credentialsCount = getCredentialsCount();
      await visit(urls.credentials);

      await click(`[href="${urls.newCredential}"]`);
      await fillIn('[name="name"]', 'random string');
      await click('.rose-form-actions [type="button"]');

      assert.strictEqual(currentURL(), urls.credentials);
      assert.strictEqual(getCredentialsCount(), credentialsCount);
    });

    test('users can cancel create new username & key pair credential', async function (assert) {
      const credentialsCount = getCredentialsCount();
      await visit(urls.credentials);

      await click(`[href="${urls.newCredential}"]`);
      await fillIn('[name="name"]', 'random string');
      await click('[value="ssh_private_key"]');
      await click('.rose-form-actions [type="button"]');

      assert.strictEqual(currentURL(), urls.credentials);
      assert.strictEqual(getCredentialsCount(), credentialsCount);
    });

    test('users can cancel create new json credential', async function (assert) {
      featuresService.enable('json-credentials');
      const credentialsCount = getCredentialsCount();
      await visit(urls.credentials);

      await click(`[href="${urls.newCredential}"]`);
      await fillIn('[name="name"]', 'random string');
      await click('[value="json"]');
      await click('.rose-form-actions [type="button"]');

      assert.strictEqual(currentURL(), urls.credentials);
      assert.strictEqual(getCredentialsCount(), credentialsCount);
    });

    test('users can switch away from JSON type credentials and the json_object value will be cleared', async function (assert) {
      featuresService.enable('json-credentials');
      const editorSelector = '[data-test-code-editor-field-editor]';
      const newSecret = '{"test": "value"}';

      await visit(urls.credentials);
      await click(`[href="${urls.newCredential}"]`);
      await click('[value="json"]');

      await fillIn(`${editorSelector} textarea`, newSecret);
      assert.dom(editorSelector).includesText(newSecret);

      await click('[value="username_password"]');

      await click('[value="json"]');
      assert.dom(editorSelector).includesText('{}');
    });

    test('users cannot navigate to new credential route without proper authorization', async function (assert) {
      featuresService.enable('static-credentials');
      instances.staticCredentialStore.authorized_collection_actions.credentials =
        instances.staticCredentialStore.authorized_collection_actions.credentials.filter(
          (item) => {
            item !== 'create';
          },
        );
      await visit(urls.credentialStores);

      await click(`[href="${urls.staticCredentialStore}"]`);

      assert.false(
        instances.staticCredentialStore.authorized_collection_actions.credentials.includes(
          'create',
        ),
      );
      assert.dom('.rose-layout-page-actions a').doesNotExist();
    });

    test('saving a new username & password credential with invalid fields displays error messages', async function (assert) {
      await visit(urls.credentials);
      this.server.post('/credentials', () => {
        return new Response(
          400,
          {},
          {
            status: 400,
            code: 'invalid_argument',
            message: 'Error in provided request.',
            details: {
              request_fields: [
                {
                  name: 'attributes.password',
                  description:
                    'Field required for creating a username-password credential.',
                },
              ],
            },
          },
        );
      });

      await click(`[href="${urls.newCredential}"]`);
      await click('[type="submit"]');

      assert
        .dom(commonSelectors.ALERT_TOAST_BODY)
        .hasText('Error in provided request.');
      assert
        .dom('[data-test-error-message-password]')
        .hasText('Field required for creating a username-password credential.');
    });

    test('saving a new username & key pair credential with invalid fields displays error messages', async function (assert) {
      await visit(urls.credentials);
      this.server.post('/credentials', () => {
        return new Response(
          400,
          {},
          {
            status: 400,
            code: 'invalid_argument',
            message: 'Error in provided request.',
            details: {
              request_fields: [
                {
                  name: 'attributes.private_key',
                  description:
                    'Field required for creating a username-key-pair credential.',
                },
              ],
            },
          },
        );
      });

      await click(`[href="${urls.newCredential}"]`);
      await click('[value="ssh_private_key"]');
      await click('[type="submit"]');

      assert
        .dom(commonSelectors.ALERT_TOAST_BODY)
        .hasText('Error in provided request.');
      assert
        .dom('[data-test-error-message-private-key]')
        .hasText('Field required for creating a username-key-pair credential.');
    });

    test('saving a new json credential with invalid fields displays error messages', async function (assert) {
      featuresService.enable('json-credentials');
      await visit(urls.credentials);
      this.server.post('/credentials', () => {
        return new Response(
          400,
          {},
          {
            status: 400,
            code: 'invalid_argument',
            message: 'Error in provided request.',
            details: {
              request_fields: [
                {
                  name: 'attributes.json_object',
                  description: 'Field required for creating a json credential.',
                },
              ],
            },
          },
        );
      });

      await click(`[href="${urls.newCredential}"]`);
      await click('[value="json"]');
      await click('[type="submit"]');

      assert
        .dom(commonSelectors.ALERT_TOAST_BODY)
        .hasText('Error in provided request.');
    });

    test('cannot navigate to json credential when feature is disabled', async function (assert) {
      await visit(urls.credentials);

      await click(`[href="${urls.newCredential}"]`);
      assert.false(featuresService.isEnabled('json-credentials'));
      assert.true(
        instances.staticCredentialStore.authorized_collection_actions.credentials.includes(
          'create',
        ),
      );
      assert.dom('.hds-form-radio-card').exists({ count: 2 });
      assert
        .dom('.hds-form-radio-card:first-child input')
        .hasAttribute('value', 'username_password');
      assert
        .dom('.hds-form-radio-card:nth-child(2) input')
        .hasAttribute('value', 'ssh_private_key');
    });

    test('users cannot directly navigate to new credential route without proper authorization', async function (assert) {
      instances.staticCredentialStore.authorized_collection_actions.credentials =
        instances.staticCredentialStore.authorized_collection_actions.credentials.filter(
          (item) => item !== 'create',
        );

      await visit(urls.newCredential);

      assert.false(
        instances.staticCredentialStore.authorized_collection_actions.credentials.includes(
          'create',
        ),
      );
      assert.strictEqual(currentURL(), urls.credentials);
    });
  },
);
