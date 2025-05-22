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
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module(
  'Acceptance | credential-stores | credentials | update',
  function (hooks) {
    setupApplicationTest(hooks);
    setupMirage(hooks);

    let featuresService;

    const instances = {
      scopes: {
        global: null,
        org: null,
        project: null,
      },
      staticCredentialStore: null,
      usernamePasswordCredential: null,
      usernameKeyPairCredential: null,
      jsonCredential: null,
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
      instances.scopes.global = this.server.create('scope', { id: 'global' });
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

      featuresService = this.owner.lookup('service:features');
      await authenticateSession({});
    });

    test('can save changes to existing username & password credential', async function (assert) {
      const mockInput = 'random string';
      assert.notEqual(instances.usernamePasswordCredential.name, mockInput);
      await visit(urls.usernamePasswordCredential);
      await click('form [type="button"]', 'Activate edit mode');
      await fillIn('[name="name"]', mockInput);
      await click('.rose-form-actions [type="submit"]');
      assert.strictEqual(currentURL(), urls.usernamePasswordCredential);
      assert.strictEqual(
        this.server.schema.credentials.where({ type: 'username_password' })
          .models[0].name,
        mockInput,
      );
    });

    test('can save changes to existing username & key pair credential', async function (assert) {
      const mockInput = 'random string';
      assert.notEqual(instances.usernameKeyPairCredential.name, mockInput);
      await visit(urls.usernameKeyPairCredential);
      await click('form [type="button"]', 'Activate edit mode');
      await fillIn('[name="name"]', mockInput);
      await click('.rose-form-actions [type="submit"]');
      assert.strictEqual(currentURL(), urls.usernameKeyPairCredential);
      assert.strictEqual(
        this.server.schema.credentials.where({ type: 'ssh_private_key' })
          .models[0].name,
        mockInput,
      );
    });

    test('can save changes to existing JSON credential', async function (assert) {
      featuresService.enable('json-credentials');
      const mockInput = 'random string';
      assert.notEqual(instances.jsonCredential.name, mockInput);
      await visit(urls.jsonCredential);
      await click('form [type="button"]', 'Activate edit mode');
      await fillIn('[name="name"]', mockInput);
      await click('.rose-form-actions [type="submit"]');
      assert.strictEqual(currentURL(), urls.jsonCredential);
      assert.strictEqual(
        this.server.schema.credentials.where({ type: 'json' }).models[0].name,
        mockInput,
      );
    });

    test('cannot make changes to an existing username & password credential without proper authorization', async function (assert) {
      instances.usernamePasswordCredential.authorized_actions =
        instances.usernamePasswordCredential.authorized_actions.filter(
          (item) => item !== 'update',
        );
      await visit(urls.usernamePasswordCredential);
      assert
        .dom('.rose-layout-page-actions .hds-button-secondary')
        .doesNotExist();
    });

    test('cannot make changes to an existing username & key pair credential without proper authorization', async function (assert) {
      instances.usernameKeyPairCredential.authorized_actions =
        instances.usernameKeyPairCredential.authorized_actions.filter(
          (item) => item !== 'update',
        );
      await visit(urls.usernameKeyPairCredential);
      assert
        .dom('.rose-layout-page-actions .hds-button-secondary')
        .doesNotExist();
    });

    test('cannot make changes to an existing JSON credential without proper authorization', async function (assert) {
      instances.jsonCredential.authorized_actions =
        instances.jsonCredential.authorized_actions.filter(
          (item) => item !== 'update',
        );
      await visit(urls.jsonCredential);
      assert
        .dom('.rose-layout-page-actions .hds-button-secondary')
        .doesNotExist();
    });

    test('can cancel changes to existing username & password credential', async function (assert) {
      const mockInput = 'random string';
      await visit(urls.usernamePasswordCredential);
      await click('form [type="button"]', 'Activate edit mode');
      await fillIn('[name="name"]', mockInput);
      await click('.rose-form-actions [type="button"]');
      assert.notEqual(instances.usernamePasswordCredential.name, mockInput);
      assert.strictEqual(
        find('[name="name"]').value,
        instances.usernamePasswordCredential.name,
      );
    });

    test('can cancel changes to existing username & key pair credential', async function (assert) {
      const mockInput = 'random string';
      await visit(urls.usernameKeyPairCredential);
      await click('form [type="button"]', 'Activate edit mode');
      await fillIn('[name="name"]', mockInput);
      await click('.rose-form-actions [type="button"]');
      assert.notEqual(instances.usernameKeyPairCredential.name, mockInput);
      assert.strictEqual(
        find('[name="name"]').value,
        instances.usernameKeyPairCredential.name,
      );
    });

    test('can cancel changes to existing JSON credential', async function (assert) {
      const mockInput = 'random string';
      await visit(urls.jsonCredential);
      await click('form [type="button"]', 'Activate edit mode');
      await fillIn('[name="name"]', mockInput);
      await click('.rose-form-actions [type="button"]');
      assert.notEqual(instances.jsonCredential.name, mockInput);
      assert.strictEqual(
        find('[name="name"]').value,
        instances.jsonCredential.name,
      );
    });

    test('saving an existing username & password credential with invalid fields displays error message', async function (assert) {
      const mockInput = 'random string';
      this.server.patch('/credentials/:id', () => {
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
                  name: 'name',
                  description: 'Name is required.',
                },
              ],
            },
          },
        );
      });
      await visit(urls.usernamePasswordCredential);
      await click('form [type="button"]', 'Activate edit mode');
      await fillIn('[name="name"]', mockInput);
      await click('[type="submit"]');
      assert
        .dom(commonSelectors.ALERT_TOAST_BODY)
        .hasText('Error in provided request.');
      assert.ok(
        find('[data-test-error-message-name]').textContent.trim(),
        'Name is required.',
      );
    });

    test('saving an existing username & key pair credential with invalid fields displays error message', async function (assert) {
      const mockInput = 'random string';
      this.server.patch('/credentials/:id', () => {
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
                  name: 'name',
                  description: 'Name is required.',
                },
              ],
            },
          },
        );
      });
      await visit(urls.usernameKeyPairCredential);
      await click('form [type="button"]', 'Activate edit mode');
      await fillIn('[name="name"]', mockInput);
      await click('[type="submit"]');
      assert
        .dom(commonSelectors.ALERT_TOAST_BODY)
        .hasText('Error in provided request.');
      assert.ok(
        find('[data-test-error-message-name]').textContent.trim(),
        'Name is required.',
      );
    });

    test('saving an existing JSON credential with invalid fields displays error message', async function (assert) {
      const mockInput = 'random string';
      this.server.patch('/credentials/:id', () => {
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
                  name: 'name',
                  description: 'Name is required.',
                },
              ],
            },
          },
        );
      });
      await visit(urls.jsonCredential);
      await click('form [type="button"]', 'Activate edit mode');
      await fillIn('[name="name"]', mockInput);
      await click('[type="submit"]');
      assert
        .dom(commonSelectors.ALERT_TOAST_BODY)
        .hasText('Error in provided request.');
      assert.ok(
        find('[data-test-error-message-name]').textContent.trim(),
        'Name is required.',
      );
    });

    test('can discard unsaved username & password credential changes via dialog', async function (assert) {
      assert.expect(5);
      const mockInput = 'random string';
      const confirmService = this.owner.lookup('service:confirm');
      confirmService.enabled = true;
      assert.notEqual(instances.usernamePasswordCredential.name, mockInput);
      await visit(urls.usernamePasswordCredential);
      await click('form [type="button"]', 'Activate edit mode');
      await fillIn('[name="name"]', mockInput);
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
          mockInput,
        );
      }
    });

    test('can discard unsaved username & key pair credential changes via dialog', async function (assert) {
      assert.expect(5);
      const mockInput = 'random string';
      const confirmService = this.owner.lookup('service:confirm');
      confirmService.enabled = true;
      assert.notEqual(instances.usernameKeyPairCredential.name, mockInput);
      await visit(urls.usernameKeyPairCredential);
      await click('form [type="button"]', 'Activate edit mode');
      await fillIn('[name="name"]', mockInput);
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
          mockInput,
        );
      }
    });

    test('can discard unsaved JSON credential changes via dialog', async function (assert) {
      assert.expect(5);
      const mockInput = 'random string';
      const confirmService = this.owner.lookup('service:confirm');
      confirmService.enabled = true;
      assert.notEqual(instances.jsonCredential.name, mockInput);
      await visit(urls.jsonCredential);
      await click('form [type="button"]', 'Activate edit mode');
      await fillIn('[name="name"]', mockInput);
      assert.strictEqual(currentURL(), urls.jsonCredential);
      try {
        await visit(urls.credentials);
      } catch (e) {
        assert.dom(commonSelectors.MODAL_WARNING).isVisible();
        await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN, 'Click Discard');
        assert.strictEqual(currentURL(), urls.credentials);
        assert.notEqual(
          this.server.schema.credentials.where({ type: 'json' }).models[0].name,
          mockInput,
        );
      }
    });

    test('can cancel discard unsaved username & password credential changes via dialog', async function (assert) {
      assert.expect(6);
      const mockInput = 'random string';
      const confirmService = this.owner.lookup('service:confirm');
      confirmService.enabled = true;
      assert.notEqual(instances.usernamePasswordCredential.name, mockInput);
      await visit(urls.usernamePasswordCredential);
      await click('form [type="button"]', 'Activate edit mode');
      const credentialName = find('[name="name"]').value;
      await fillIn('[name="name"]', mockInput);
      assert.strictEqual(currentURL(), urls.usernamePasswordCredential);
      try {
        await visit(urls.credentials);
      } catch (e) {
        assert.dom(commonSelectors.MODAL_WARNING).isVisible();
        await click(commonSelectors.MODAL_WARNING_CANCEL_BTN, 'Click Cancel');
        assert.strictEqual(currentURL(), urls.usernamePasswordCredential);
        assert.strictEqual(find('[name="name"]').value, mockInput);
        assert.strictEqual(
          this.server.schema.credentials.where({ type: 'username_password' })
            .models[0].name,
          credentialName,
        );
      }
    });

    test('can cancel discard unsaved username & key pair credential changes via dialog', async function (assert) {
      assert.expect(6);
      const mockInput = 'random string';
      const confirmService = this.owner.lookup('service:confirm');
      confirmService.enabled = true;
      assert.notEqual(instances.usernameKeyPairCredential.name, mockInput);
      await visit(urls.usernameKeyPairCredential);
      await click('form [type="button"]', 'Activate edit mode');
      const credentialName = find('[name="name"]').value;
      await fillIn('[name="name"]', mockInput);
      assert.strictEqual(currentURL(), urls.usernameKeyPairCredential);
      try {
        await visit(urls.credentials);
      } catch (e) {
        assert.dom(commonSelectors.MODAL_WARNING).isVisible();
        await click(commonSelectors.MODAL_WARNING_CANCEL_BTN, 'Click Cancel');
        assert.strictEqual(currentURL(), urls.usernameKeyPairCredential);
        assert.strictEqual(find('[name="name"]').value, mockInput);
        assert.strictEqual(
          this.server.schema.credentials.where({ type: 'ssh_private_key' })
            .models[0].name,
          credentialName,
        );
      }
    });

    test('can cancel discard unsaved JSON credential changes via dialog', async function (assert) {
      assert.expect(6);
      const mockInput = 'random string';
      const confirmService = this.owner.lookup('service:confirm');
      confirmService.enabled = true;
      assert.notEqual(instances.jsonCredential.name, mockInput);
      await visit(urls.jsonCredential);
      await click('form [type="button"]', 'Activate edit mode');
      const credentialName = find('[name="name"]').value;
      await fillIn('[name="name"]', mockInput);
      assert.strictEqual(currentURL(), urls.jsonCredential);
      try {
        await visit(urls.credentials);
      } catch (e) {
        assert.dom(commonSelectors.MODAL_WARNING).isVisible();
        await click(commonSelectors.MODAL_WARNING_CANCEL_BTN, 'Click Cancel');
        assert.strictEqual(currentURL(), urls.jsonCredential);
        assert.strictEqual(find('[name="name"]').value, mockInput);
        assert.strictEqual(
          this.server.schema.credentials.where({ type: 'json' }).models[0].name,
          credentialName,
        );
      }
    });

    test('password field renders in edit mode only for a username & password credential', async function (assert) {
      await visit(urls.usernamePasswordCredential);
      assert.dom('[name="password"]').doesNotExist();
      await click('form [type="button"]', 'Activate edit mode');
      assert.strictEqual(currentURL(), urls.usernamePasswordCredential);
      assert.dom('[name="password"]').isVisible();
    });

    test('private_key and private_key_passphrase fields render in edit mode only for a username & key pair credential', async function (assert) {
      await visit(urls.usernameKeyPairCredential);
      assert.dom('[name="private_key"]').doesNotExist();
      assert.dom('[name="private_key_passphrase"]').doesNotExist();
      await click('form [type="button"]', 'Activate edit mode');
      assert.strictEqual(currentURL(), urls.usernameKeyPairCredential);
      assert.dom('[name="private_key"]').isVisible();
      assert.dom('[name="private_key_passphrase"]').isVisible();
    });

    test('secret editor is in actionable state when entering edit mode of a JSON credential', async function (assert) {
      await visit(urls.jsonCredential);
      assert.dom('.secret-editor-skeleton-message button').doesNotExist();
      await click('form [type="button"]', 'Activate edit mode');
      assert.strictEqual(currentURL(), urls.jsonCredential);
      assert.dom('.secret-editor-skeleton-message button').isVisible();
    });

    test('secret editor enters editing state when clicking edit button in the secret editor of a JSON credential', async function (assert) {
      await visit(urls.jsonCredential);
      await click('form [type="button"]', 'Activate edit mode');
      assert.strictEqual(currentURL(), urls.jsonCredential);
      assert.dom('.secret-editor-skeleton-message button').isVisible();
      await click(
        '.secret-editor-skeleton-message button',
        'Enter editing mode',
      );
      assert.dom('.secret-editor-skeleton-message button').doesNotExist();
      await waitUntil(() => assert.dom('.CodeMirror').isVisible());
    });
  },
);
