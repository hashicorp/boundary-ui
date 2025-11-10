/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  find,
  click,
  fillIn,
  waitUntil,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
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
  'Acceptance | credential-stores | credentials | update',
  function (hooks) {
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
      usernamePasswordDomainCredential: null,
      passwordCredential: null,
    };

    const mockResponseMessage = 'Error in provided request.';
    const mockResponseDescription = 'Name is required.';
    const mockResponse = () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: mockResponseMessage,
          details: {
            request_fields: [
              {
                name: 'name',
                description: mockResponseDescription,
              },
            ],
          },
        },
      );
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
    });

    test('can save changes to existing username & password credential', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-26
            enabled: false,
          },
        },
      });

      assert.notEqual(
        instances.usernamePasswordCredential.name,
        commonSelectors.FIELD_NAME_VALUE,
      );
      await visit(urls.usernamePasswordCredential);

      await click(commonSelectors.EDIT_BTN);
      await fillIn(
        commonSelectors.FIELD_NAME,
        commonSelectors.FIELD_NAME_VALUE,
      );
      await click(commonSelectors.SAVE_BTN);

      assert.strictEqual(currentURL(), urls.usernamePasswordCredential);
      assert.strictEqual(
        this.server.schema.credentials.where({ type: 'username_password' })
          .models[0].name,
        commonSelectors.FIELD_NAME_VALUE,
      );
    });

    test('can save changes to existing username & key pair credential', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

      assert.notEqual(
        instances.usernameKeyPairCredential.name,
        commonSelectors.FIELD_NAME_VALUE,
      );
      await visit(urls.usernameKeyPairCredential);

      await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
      await fillIn(
        commonSelectors.FIELD_NAME,
        commonSelectors.FIELD_NAME_VALUE,
      );
      await click(commonSelectors.SAVE_BTN);

      assert.strictEqual(currentURL(), urls.usernameKeyPairCredential);
      assert.strictEqual(
        this.server.schema.credentials.where({ type: 'ssh_private_key' })
          .models[0].name,
        commonSelectors.FIELD_NAME_VALUE,
      );
    });

    test('can save changes to existing JSON credential', async function (assert) {
      assert.notEqual(
        instances.jsonCredential.name,
        commonSelectors.FIELD_NAME,
      );
      await visit(urls.jsonCredential);

      await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
      await fillIn(
        commonSelectors.FIELD_NAME,
        commonSelectors.FIELD_NAME_VALUE,
      );
      await click(commonSelectors.SAVE_BTN);

      assert.strictEqual(currentURL(), urls.jsonCredential);
      assert.strictEqual(
        this.server.schema.credentials.where({ type: 'json' }).models[0].name,
        commonSelectors.FIELD_NAME_VALUE,
      );
    });

    test('can save changes to existing username, password & domain credential', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-26
            enabled: false,
          },
        },
      });

      const mockInput = 'random string';

      await visit(urls.usernamePasswordDomainCredential);

      await click('form [type="button"]', 'Activate edit mode');
      await fillIn(selectors.FIELD_USERNAME, mockInput);
      await fillIn(selectors.FIELD_DOMAIN, 'g.com');
      await click(commonSelectors.SAVE_BTN);

      assert.strictEqual(currentURL(), urls.usernamePasswordDomainCredential);

      const credential = this.server.schema.credentials.where({
        type: 'username_password_domain',
      }).models[0];

      assert.strictEqual(credential.attributes.username, mockInput);
      assert.strictEqual(credential.attributes.domain, 'g.com');
    });

    test('can save changes to existing password credential', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-11-06
            enabled: false,
          },
        },
      });

      assert.notEqual(
        instances.passwordCredential.name,
        commonSelectors.FIELD_NAME_VALUE,
      );
      await visit(urls.passwordCredential);

      await click(commonSelectors.EDIT_BTN);
      await fillIn(
        commonSelectors.FIELD_NAME,
        commonSelectors.FIELD_NAME_VALUE,
      );
      await click(commonSelectors.SAVE_BTN);

      assert.strictEqual(currentURL(), urls.passwordCredential);
      assert.strictEqual(
        this.server.schema.credentials.where({ type: TYPE_CREDENTIAL_PASSWORD })
          .models[0].name,
        commonSelectors.FIELD_NAME_VALUE,
      );
    });

    test('cannot make changes to an existing username & password credential without proper authorization', async function (assert) {
      instances.usernamePasswordCredential.authorized_actions =
        instances.usernamePasswordCredential.authorized_actions.filter(
          (item) => item !== 'update',
        );

      await visit(urls.usernamePasswordCredential);

      assert.dom(commonSelectors.EDIT_BTN).doesNotExist();
    });

    test('cannot make changes to an existing username & key pair credential without proper authorization', async function (assert) {
      instances.usernameKeyPairCredential.authorized_actions =
        instances.usernameKeyPairCredential.authorized_actions.filter(
          (item) => item !== 'update',
        );
      await visit(urls.usernameKeyPairCredential);

      assert.dom(commonSelectors.EDIT_BTN).doesNotExist();
    });

    test('cannot make changes to an existing JSON credential without proper authorization', async function (assert) {
      instances.jsonCredential.authorized_actions =
        instances.jsonCredential.authorized_actions.filter(
          (item) => item !== 'update',
        );
      await visit(urls.jsonCredential);

      assert.dom(commonSelectors.EDIT_BTN).doesNotExist();
    });

    test('cannot make changes to an existing password credential without proper authorization', async function (assert) {
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
          (item) => item !== 'update',
        );
      await visit(urls.credentials);

      await click(commonSelectors.HREF(urls.passwordCredential));

      assert.dom(commonSelectors.EDIT_BTN).doesNotExist();
    });

    test('can cancel changes to existing username & password credential', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-26
            enabled: false,
          },
        },
      });

      await visit(urls.usernamePasswordCredential);
      await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
      await fillIn(
        commonSelectors.FIELD_NAME,
        commonSelectors.FIELD_NAME_VALUE,
      );
      await click(commonSelectors.CANCEL_BTN);

      assert.notEqual(
        instances.usernamePasswordCredential.name,
        commonSelectors.FIELD_NAME_VALUE,
      );
      assert
        .dom(commonSelectors.FIELD_NAME)
        .hasValue(instances.usernamePasswordCredential.name);
    });

    test('can cancel changes to existing username & key pair credential', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

      await visit(urls.usernameKeyPairCredential);

      await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
      await fillIn(
        commonSelectors.FIELD_NAME,
        commonSelectors.FIELD_NAME_VALUE,
      );
      await click(commonSelectors.CANCEL_BTN);

      assert.notEqual(
        instances.usernameKeyPairCredential.name,
        commonSelectors.FIELD_NAME_VALUE,
      );
      assert
        .dom(commonSelectors.FIELD_NAME)
        .hasValue(instances.usernameKeyPairCredential.name);
    });

    test('can cancel changes to existing JSON credential', async function (assert) {
      await visit(urls.jsonCredential);

      await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
      await fillIn(
        commonSelectors.FIELD_NAME,
        commonSelectors.FIELD_NAME_VALUE,
      );
      await click(commonSelectors.CANCEL_BTN);

      assert.notEqual(
        instances.jsonCredential.name,
        commonSelectors.FIELD_NAME_VALUE,
      );
      assert
        .dom(commonSelectors.FIELD_NAME)
        .hasValue(instances.jsonCredential.name);
    });

    test('can cancel changes to existing password credential', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-11-06
            enabled: false,
          },
        },
      });

      await visit(urls.passwordCredential);
      await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
      await fillIn(
        commonSelectors.FIELD_NAME,
        commonSelectors.FIELD_NAME_VALUE,
      );
      await click(commonSelectors.CANCEL_BTN);

      assert.notEqual(
        instances.passwordCredential.name,
        commonSelectors.FIELD_NAME_VALUE,
      );
      assert
        .dom(commonSelectors.FIELD_NAME)
        .hasValue(instances.passwordCredential.name);
    });

    test('saving an existing username & password credential with invalid fields displays error message', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-26
            enabled: false,
          },
        },
      });

      this.server.patch('/credentials/:id', mockResponse);
      await visit(urls.usernamePasswordCredential);

      await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
      await fillIn(
        commonSelectors.FIELD_NAME,
        commonSelectors.FIELD_NAME_VALUE,
      );
      await click(commonSelectors.SAVE_BTN);

      assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText(mockResponseMessage);
      assert
        .dom(commonSelectors.FIELD_NAME_ERROR)
        .hasText(mockResponseDescription);
    });

    test('saving an existing username & key pair credential with invalid fields displays error message', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

      this.server.patch('/credentials/:id', mockResponse);
      await visit(urls.usernameKeyPairCredential);

      await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
      await fillIn(
        commonSelectors.FIELD_NAME,
        commonSelectors.FIELD_NAME_VALUE,
      );
      await click(commonSelectors.SAVE_BTN);

      assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText(mockResponseMessage);
      assert
        .dom(commonSelectors.FIELD_NAME_ERROR)
        .hasText(mockResponseDescription);
    });

    test('saving an existing JSON credential with invalid fields displays error message', async function (assert) {
      this.server.patch('/credentials/:id', mockResponse);
      await visit(urls.jsonCredential);

      await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
      await fillIn(
        commonSelectors.FIELD_NAME,
        commonSelectors.FIELD_NAME_VALUE,
      );
      await click(commonSelectors.SAVE_BTN);

      assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText(mockResponseMessage);
      assert
        .dom(commonSelectors.FIELD_NAME_ERROR)
        .hasText(mockResponseDescription);
    });

    test('saving an existing password credential with invalid fields displays error message', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-11-06
            enabled: false,
          },
        },
      });

      this.server.patch('/credentials/:id', mockResponse);
      await visit(urls.passwordCredential);

      await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
      await fillIn(
        commonSelectors.FIELD_NAME,
        commonSelectors.FIELD_NAME_VALUE,
      );
      await click(commonSelectors.SAVE_BTN);

      assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText(mockResponseMessage);
      assert
        .dom(commonSelectors.FIELD_NAME_ERROR)
        .hasText(mockResponseDescription);
    });

    test('can discard unsaved username & password credential changes via dialog', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

      assert.expect(5);
      const confirmService = this.owner.lookup('service:confirm');
      confirmService.enabled = true;
      assert.notEqual(
        instances.usernamePasswordCredential.name,
        commonSelectors.FIELD_NAME_VALUE,
      );
      await visit(urls.usernamePasswordCredential);

      await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
      await fillIn(
        commonSelectors.FIELD_NAME,
        commonSelectors.FIELD_NAME_VALUE,
      );
      assert.strictEqual(currentURL(), urls.usernamePasswordCredential);
      try {
        await visit(urls.credentials);
      } catch (e) {
        assert.dom(commonSelectors.MODAL_WARNING).isVisible();

        await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN, 'Click Discard');

        assert.strictEqual(currentURL(), urls.credentials);
        assert.notEqual(
          this.server.schema.credentials.where({ type: 'username_password' })
            .models[0].name,
          commonSelectors.FIELD_NAME_VALUE,
        );
      }
    });

    test('can discard unsaved username & key pair credential changes via dialog', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

      assert.expect(5);
      const confirmService = this.owner.lookup('service:confirm');
      confirmService.enabled = true;
      assert.notEqual(
        instances.usernameKeyPairCredential.name,
        commonSelectors.FIELD_NAME_VALUE,
      );
      await visit(urls.usernameKeyPairCredential);

      await click(commonSelectors.EDIT_BTN);
      await fillIn(
        commonSelectors.FIELD_NAME,
        commonSelectors.FIELD_NAME_VALUE,
      );

      assert.strictEqual(currentURL(), urls.usernameKeyPairCredential);

      try {
        await visit(urls.credentials);
      } catch (e) {
        assert.dom(commonSelectors.MODAL_WARNING).isVisible();

        await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN, 'Click Discard');

        assert.strictEqual(currentURL(), urls.credentials);
        assert.notEqual(
          this.server.schema.credentials.where({ type: 'ssh_private_key' })
            .models[0].name,
          commonSelectors.FIELD_NAME_VALUE,
        );
      }
    });

    test('can discard unsaved JSON credential changes via dialog', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

      assert.expect(5);
      const confirmService = this.owner.lookup('service:confirm');
      confirmService.enabled = true;
      assert.notEqual(
        instances.jsonCredential.name,
        commonSelectors.FIELD_NAME_VALUE,
      );
      await visit(urls.jsonCredential);

      await click(commonSelectors.EDIT_BTN);
      await fillIn(
        commonSelectors.FIELD_NAME,
        commonSelectors.FIELD_NAME_VALUE,
      );
      assert.strictEqual(currentURL(), urls.jsonCredential);

      try {
        await visit(urls.credentials);
      } catch (e) {
        assert.dom(commonSelectors.MODAL_WARNING).isVisible();

        await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN, 'Click Discard');

        assert.strictEqual(currentURL(), urls.credentials);
        assert.notEqual(
          this.server.schema.credentials.where({ type: 'json' }).models[0].name,
          commonSelectors.FIELD_NAME_VALUE,
        );
      }
    });

    test('can discard unsaved password credential changes via dialog', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-11-06
            enabled: false,
          },
        },
      });

      assert.expect(5);
      const confirmService = this.owner.lookup('service:confirm');
      confirmService.enabled = true;
      assert.notEqual(
        instances.passwordCredential.name,
        commonSelectors.FIELD_NAME_VALUE,
      );
      await visit(urls.passwordCredential);

      await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
      await fillIn(
        commonSelectors.FIELD_NAME,
        commonSelectors.FIELD_NAME_VALUE,
      );
      assert.strictEqual(currentURL(), urls.passwordCredential);
      try {
        await visit(urls.credentials);
      } catch (e) {
        assert.dom(commonSelectors.MODAL_WARNING).isVisible();

        await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN, 'Click Discard');

        assert.strictEqual(currentURL(), urls.credentials);
        assert.notEqual(
          this.server.schema.credentials.where({
            type: TYPE_CREDENTIAL_PASSWORD,
          }).models[0].name,
          commonSelectors.FIELD_NAME_VALUE,
        );
      }
    });

    test('can cancel discard unsaved username & password credential changes via dialog', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-26
            enabled: false,
          },
        },
      });

      assert.expect(6);
      const confirmService = this.owner.lookup('service:confirm');
      confirmService.enabled = true;
      assert.notEqual(
        instances.usernamePasswordCredential.name,
        commonSelectors.FIELD_NAME_VALUE,
      );
      await visit(urls.usernamePasswordCredential);

      await click(commonSelectors.EDIT_BTN);
      const credentialName = find(commonSelectors.FIELD_NAME).value;
      await fillIn(
        commonSelectors.FIELD_NAME,
        commonSelectors.FIELD_NAME_VALUE,
      );

      assert.strictEqual(currentURL(), urls.usernamePasswordCredential);

      try {
        await visit(urls.credentials);
      } catch (e) {
        assert.dom(commonSelectors.MODAL_WARNING).isVisible();

        await click(commonSelectors.MODAL_WARNING_CANCEL_BTN, 'Click Cancel');

        assert.strictEqual(currentURL(), urls.usernamePasswordCredential);
        assert
          .dom(commonSelectors.FIELD_NAME)
          .hasValue(commonSelectors.FIELD_NAME_VALUE);
        assert.strictEqual(
          this.server.schema.credentials.where({ type: 'username_password' })
            .models[0].name,
          credentialName,
        );
      }
    });

    test('can cancel discard unsaved username & key pair credential changes via dialog', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

      assert.expect(6);
      const confirmService = this.owner.lookup('service:confirm');
      confirmService.enabled = true;
      assert.notEqual(
        instances.usernameKeyPairCredential.name,
        commonSelectors.FIELD_NAME_VALUE,
      );
      await visit(urls.usernameKeyPairCredential);

      await click(commonSelectors.EDIT_BTN);
      const credentialName = find(commonSelectors.FIELD_NAME).value;
      await fillIn(
        commonSelectors.FIELD_NAME,
        commonSelectors.FIELD_NAME_VALUE,
      );

      assert.strictEqual(currentURL(), urls.usernameKeyPairCredential);

      try {
        await visit(urls.credentials);
      } catch (e) {
        assert.dom(commonSelectors.MODAL_WARNING).isVisible();

        await click(commonSelectors.MODAL_WARNING_CANCEL_BTN, 'Click Cancel');

        assert.strictEqual(currentURL(), urls.usernameKeyPairCredential);
        assert
          .dom(commonSelectors.FIELD_NAME)
          .hasValue(commonSelectors.FIELD_NAME_VALUE);
        assert.strictEqual(
          this.server.schema.credentials.where({ type: 'ssh_private_key' })
            .models[0].name,
          credentialName,
        );
      }
    });

    test('can cancel unsaved username, password & domain credential changes via dialog', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-26
            enabled: false,
          },
        },
      });

      const name = instances.usernamePasswordDomainCredential.name;
      await visit(urls.usernamePasswordDomainCredential);

      await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
      await fillIn('[name="username"]', 'random string');

      // cancel changes
      await click(commonSelectors.CANCEL_BTN);

      assert.strictEqual(instances.usernamePasswordDomainCredential.name, name);
    });

    test('can cancel discard unsaved JSON credential changes via dialog', async function (assert) {
      assert.expect(6);
      const confirmService = this.owner.lookup('service:confirm');
      confirmService.enabled = true;
      assert.notEqual(
        instances.jsonCredential.name,
        commonSelectors.FIELD_NAME_VALUE,
      );
      await visit(urls.jsonCredential);

      await click(commonSelectors.EDIT_BTN);
      const credentialName = find(commonSelectors.FIELD_NAME).value;
      await fillIn(
        commonSelectors.FIELD_NAME,
        commonSelectors.FIELD_NAME_VALUE,
      );
      assert.strictEqual(currentURL(), urls.jsonCredential);
      try {
        await visit(urls.credentials);
      } catch (e) {
        assert.dom(commonSelectors.MODAL_WARNING).isVisible();
        await click(commonSelectors.MODAL_WARNING_CANCEL_BTN, 'Click Cancel');
        assert.strictEqual(currentURL(), urls.jsonCredential);
        assert
          .dom(commonSelectors.FIELD_NAME)
          .hasValue(commonSelectors.FIELD_NAME_VALUE);
        assert.strictEqual(
          this.server.schema.credentials.where({ type: 'json' }).models[0].name,
          credentialName,
        );
      }
    });

    test('can cancel discard unsaved password credential changes via dialog', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-11-06
            enabled: false,
          },
        },
      });

      assert.expect(6);
      const confirmService = this.owner.lookup('service:confirm');
      confirmService.enabled = true;
      assert.notEqual(
        instances.passwordCredential.name,
        commonSelectors.FIELD_NAME_VALUE,
      );
      await visit(urls.passwordCredential);

      await click(commonSelectors.EDIT_BTN);
      const credentialName = find(commonSelectors.FIELD_NAME).value;
      await fillIn(
        commonSelectors.FIELD_NAME,
        commonSelectors.FIELD_NAME_VALUE,
      );

      assert.strictEqual(currentURL(), urls.passwordCredential);

      try {
        await visit(urls.credentials);
      } catch (e) {
        assert.dom(commonSelectors.MODAL_WARNING).isVisible();

        await click(commonSelectors.MODAL_WARNING_CANCEL_BTN, 'Click Cancel');

        assert.strictEqual(currentURL(), urls.passwordCredential);
        assert
          .dom(commonSelectors.FIELD_NAME)
          .hasValue(commonSelectors.FIELD_NAME_VALUE);
        assert.strictEqual(
          this.server.schema.credentials.where({
            type: TYPE_CREDENTIAL_PASSWORD,
          }).models[0].name,
          credentialName,
        );
      }
    });

    test('password field renders in edit mode only for a username & password credential', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-26
            enabled: false,
          },
        },
      });

      await visit(urls.usernamePasswordCredential);

      assert.dom(commonSelectors.FIELD_PASSWORD).doesNotExist();

      await click(commonSelectors.EDIT_BTN);

      assert.strictEqual(currentURL(), urls.usernamePasswordCredential);
      assert.dom(commonSelectors.FIELD_PASSWORD).isVisible();
    });

    test('password field renders in edit mode only for a password credential', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-11-06
            enabled: false,
          },
        },
      });

      await visit(urls.passwordCredential);

      assert.dom(commonSelectors.FIELD_PASSWORD).doesNotExist();

      await click(commonSelectors.EDIT_BTN);

      assert.strictEqual(currentURL(), urls.passwordCredential);
      assert.dom(commonSelectors.FIELD_PASSWORD).isVisible();
    });

    test('private_key and private_key_passphrase fields render in edit mode only for a username & key pair credential', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

      await visit(urls.usernameKeyPairCredential);

      assert.dom(selectors.FIELD_SSH_PRIVATE_KEY).doesNotExist();
      assert.dom(selectors.FIELD_SSH_PRIVATE_KEY_PASSPHRASE).doesNotExist();

      await click(commonSelectors.EDIT_BTN);

      assert.strictEqual(currentURL(), urls.usernameKeyPairCredential);
      assert.dom(selectors.FIELD_SSH_PRIVATE_KEY).isVisible();
      assert.dom(selectors.FIELD_SSH_PRIVATE_KEY_PASSPHRASE).isVisible();
    });

    test('secret editor is in actionable state when entering edit mode of a JSON credential', async function (assert) {
      await visit(urls.jsonCredential);

      assert.dom(selectors.REPLACE_SECRET_BTN).doesNotExist();

      await click(commonSelectors.EDIT_BTN);

      assert.strictEqual(currentURL(), urls.jsonCredential);
      assert.dom(selectors.REPLACE_SECRET_BTN).isVisible();
    });

    test('secret editor enters editing state when clicking edit button in the secret editor of a JSON credential', async function (assert) {
      setRunOptions({
        rules: {
          label: {
            // [ember-a11y-ignore]: axe rule "label" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

      await visit(urls.jsonCredential);

      await click(commonSelectors.EDIT_BTN);

      assert.strictEqual(currentURL(), urls.jsonCredential);
      assert.dom(selectors.REPLACE_SECRET_BTN).isVisible();

      await click(selectors.REPLACE_SECRET_BTN);

      assert.dom(selectors.REPLACE_SECRET_BTN).doesNotExist();
      await waitUntil(() => assert.dom('.CodeMirror').isVisible());
    });
  },
);
