/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  click,
  fillIn,
  find,
  waitFor,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { Response } from 'miragejs';
import * as selectors from './selectors';
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

      await click(commonSelectors.HREF(urls.newCredential));
      await fillIn(
        commonSelectors.FIELD_NAME,
        commonSelectors.FIELD_NAME_VALUE,
      );
      await click(commonSelectors.SAVE_BTN);

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

      await click(commonSelectors.HREF(urls.newCredential));
      await fillIn(
        commonSelectors.FIELD_NAME,
        commonSelectors.FIELD_NAME_VALUE,
      );
      await click(selectors.FIELD_TYPE_SSH);
      await click(commonSelectors.SAVE_BTN);

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

      await click(commonSelectors.HREF(urls.newCredential));
      await fillIn(
        commonSelectors.FIELD_NAME,
        commonSelectors.FIELD_NAME_VALUE,
      );
      await click(selectors.FIELD_TYPE_JSON);
      await click(commonSelectors.SAVE_BTN);

      assert.strictEqual(getCredentialsCount(), credentialsCount + 1);
      assert.strictEqual(getJsonCredentialCount(), jsonCredentialCount + 1);
    });

    test('users can cancel create new username & password credential', async function (assert) {
      const credentialsCount = getCredentialsCount();
      await visit(urls.credentials);

      await click(commonSelectors.HREF(urls.newCredential));
      await fillIn(
        commonSelectors.FIELD_NAME,
        commonSelectors.FIELD_NAME_VALUE,
      );
      await click(commonSelectors.CANCEL_BTN);

      assert.strictEqual(currentURL(), urls.credentials);
      assert.strictEqual(getCredentialsCount(), credentialsCount);
    });

    test('users can cancel create new username & key pair credential', async function (assert) {
      const credentialsCount = getCredentialsCount();
      await visit(urls.credentials);

      await click(commonSelectors.HREF(urls.newCredential));
      await fillIn(
        commonSelectors.FIELD_NAME,
        commonSelectors.FIELD_NAME_VALUE,
      );
      await click(selectors.FIELD_TYPE_SSH);
      await click(commonSelectors.CANCEL_BTN);

      assert.strictEqual(currentURL(), urls.credentials);
      assert.strictEqual(getCredentialsCount(), credentialsCount);
    });

    test('users can cancel create new json credential', async function (assert) {
      featuresService.enable('json-credentials');
      const credentialsCount = getCredentialsCount();
      await visit(urls.credentials);

      await click(commonSelectors.HREF(urls.newCredential));
      await fillIn(
        commonSelectors.FIELD_NAME,
        commonSelectors.FIELD_NAME_VALUE,
      );
      await click(selectors.FIELD_TYPE_JSON);
      await click(commonSelectors.CANCEL_BTN);

      assert.strictEqual(currentURL(), urls.credentials);
      assert.strictEqual(getCredentialsCount(), credentialsCount);
    });

    test('users can switch away from JSON type credentials and the json_object value will be cleared', async function (assert) {
      featuresService.enable('json-credentials');

      await visit(urls.credentials);
      await click(commonSelectors.HREF(urls.newCredential));
      await click(selectors.FIELD_TYPE_JSON);

      await waitFor('.cm-editor');

      const editorElement = find('.hds-code-editor__editor');
      const editorView = editorElement.editor;
      editorView.dispatch({
        changes: {
          from: editorView.state.selection.main.from,
          insert: selectors.FIELD_EDITOR_VALUE,
        },
      });
      assert.dom(selectors.EDITOR).includesText(selectors.FIELD_EDITOR_VALUE);
      await click(selectors.FIELD_TYPE_USERNAME_PASSWORD);

      await click(selectors.FIELD_TYPE_JSON);
      assert.dom(selectors.EDITOR).includesText('{}');
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

      await click(commonSelectors.HREF(urls.staticCredentialStore));

      assert.false(
        instances.staticCredentialStore.authorized_collection_actions.credentials.includes(
          'create',
        ),
      );
      assert.dom(selectors.MANAGE_DROPDOWN_NEW_CREDENTIAL).doesNotExist();
    });

    test('saving a new username & password credential with invalid fields displays error messages', async function (assert) {
      const errorMessage = 'Error in provided request.';
      const errorDescription =
        'Field required for creating a username-password credential.';
      await visit(urls.credentials);
      this.server.post('/credentials', () => {
        return new Response(
          400,
          {},
          {
            status: 400,
            code: 'invalid_argument',
            message: errorMessage,
            details: {
              request_fields: [
                {
                  name: 'attributes.password',
                  description: errorDescription,
                },
              ],
            },
          },
        );
      });

      await click(commonSelectors.HREF(urls.newCredential));
      await click(commonSelectors.SAVE_BTN);

      assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText(errorMessage);
      assert.dom(selectors.FIELD_PASSWORD_ERROR).hasText(errorDescription);
    });

    test('saving a new username & key pair credential with invalid fields displays error messages', async function (assert) {
      const errorMessage = 'Error in provided request.';
      const errorDescription =
        'Field required for creating a username-key-pair credential.';
      await visit(urls.credentials);
      this.server.post('/credentials', () => {
        return new Response(
          400,
          {},
          {
            status: 400,
            code: 'invalid_argument',
            message: errorMessage,
            details: {
              request_fields: [
                {
                  name: 'attributes.private_key',
                  description: errorDescription,
                },
              ],
            },
          },
        );
      });

      await click(commonSelectors.HREF(urls.newCredential));
      await click(selectors.FIELD_TYPE_SSH);
      await click(commonSelectors.SAVE_BTN);

      assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText(errorMessage);
      assert
        .dom(selectors.FIELD_SSH_PRIVATE_KEY_ERROR)
        .hasText(errorDescription);
    });

    test('saving a new json credential with invalid fields displays error messages', async function (assert) {
      featuresService.enable('json-credentials');
      const errorMessage = 'Error in provided request.';
      await visit(urls.credentials);
      this.server.post('/credentials', () => {
        return new Response(
          400,
          {},
          {
            status: 400,
            code: 'invalid_argument',
            message: errorMessage,
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

      await click(commonSelectors.HREF(urls.newCredential));
      await click(selectors.FIELD_TYPE_JSON);
      await click(commonSelectors.SAVE_BTN);

      assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText(errorMessage);
    });

    test('cannot navigate to json credential when feature is disabled', async function (assert) {
      await visit(urls.credentials);

      await click(commonSelectors.HREF(urls.newCredential));

      assert.false(featuresService.isEnabled('json-credentials'));
      assert.true(
        instances.staticCredentialStore.authorized_collection_actions.credentials.includes(
          'create',
        ),
      );
      assert
        .dom(selectors.FIELD_TYPE_USERNAME_PASSWORD)
        .exists()
        .hasAttribute('value', 'username_password');
      assert
        .dom(selectors.FIELD_TYPE_SSH)
        .exists()
        .hasAttribute('value', 'ssh_private_key');
      assert.dom(selectors.FIELD_TYPE_JSON).doesNotExist();
    });

    test('users cannot create a new credential without proper authorization', async function (assert) {
      instances.staticCredentialStore.authorized_collection_actions.credentials =
        instances.staticCredentialStore.authorized_collection_actions.credentials.filter(
          (item) => item !== 'create',
        );

      await visit(urls.credentials);
      await click(selectors.MANAGE_DROPDOWN_CREDENTIAL_STORE);

      assert.false(
        instances.staticCredentialStore.authorized_collection_actions.credentials.includes(
          'create',
        ),
      );
      assert.dom(commonSelectors.HREF(urls.newCredential)).doesNotExist();
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
