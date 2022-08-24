import { module, test } from 'qunit';
import { visit, currentURL, find, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';

module(
  'Acceptance | credential-stores | credentials | update',
  function (hooks) {
    setupApplicationTest(hooks);
    setupMirage(hooks);

    const instances = {
      scopes: {
        global: null,
        org: null,
        project: null,
      },
      staticCredentialStore: null,
      usernamePasswordCredential: null,
      usernameKeyPairCredential: null,
    };

    const urls = {
      projectScope: null,
      credentialStores: null,
      staticCredentialStore: null,
      credentials: null,
      usernamePasswordCredential: null,
      usernameKeyPairCredential: null,
    };

    hooks.beforeEach(function () {
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
      // Generate route URLs for resources
      urls.projectScope = `/scopes/${instances.scopes.project.id}`;
      urls.credentialStores = `${urls.projectScope}/credential-stores`;
      urls.staticCredentialStore = `${urls.credentialStores}/${instances.staticCredentialStore.id}`;
      urls.credentials = `${urls.staticCredentialStore}/credentials`;
      urls.usernamePasswordCredential = `${urls.credentials}/${instances.usernamePasswordCredential.id}`;
      urls.usernameKeyPairCredential = `${urls.credentials}/${instances.usernameKeyPairCredential.id}`;
      authenticateSession({});
    });

    test('can save changes to existing username & password credential', async function (assert) {
      assert.expect(3);
      assert.notEqual(
        instances.usernamePasswordCredential.name,
        'random string'
      );
      await visit(urls.usernamePasswordCredential);
      await click('form [type="button"]', 'Activate edit mode');
      await fillIn('[name="name"]', 'random string');
      await click('.rose-form-actions [type="submit"]');
      assert.strictEqual(currentURL(), urls.usernamePasswordCredential);
      assert.strictEqual(
        this.server.schema.credentials.where({ type: 'username_password' })
          .models[0].name,
        'random string'
      );
    });

    test('can save changes to existing username & key pair credential', async function (assert) {
      assert.expect(3);
      assert.notEqual(
        instances.usernameKeyPairCredential.name,
        'random string'
      );
      await visit(urls.usernameKeyPairCredential);
      await click('form [type="button"]', 'Activate edit mode');
      await fillIn('[name="name"]', 'random string');
      await click('.rose-form-actions [type="submit"]');
      assert.strictEqual(currentURL(), urls.usernameKeyPairCredential);
      assert.strictEqual(
        this.server.schema.credentials.where({ type: 'ssh_private_key' })
          .models[0].name,
        'random string'
      );
    });

    test('cannot make changes to an existing username & password credential without proper authorization', async function (assert) {
      assert.expect(1);
      instances.usernamePasswordCredential.authorized_actions =
        instances.usernamePasswordCredential.authorized_actions.filter(
          (item) => item !== 'update'
        );
      await visit(urls.usernamePasswordCredential);
      assert.notOk(find('.rose-layout-page-actions .rose-button-secondary'));
    });

    test('cannot make changes to an existing username & key pair credential without proper authorization', async function (assert) {
      assert.expect(1);
      instances.usernameKeyPairCredential.authorized_actions =
        instances.usernameKeyPairCredential.authorized_actions.filter(
          (item) => item !== 'update'
        );
      await visit(urls.usernameKeyPairCredential);
      assert.notOk(find('.rose-layout-page-actions .rose-button-secondary'));
    });

    test('can cancel changes to existing username & password credential', async function (assert) {
      assert.expect(2);
      await visit(urls.usernamePasswordCredential);
      await click('form [type="button"]', 'Activate edit mode');
      await fillIn('[name="name"]', 'random string');
      await click('.rose-form-actions [type="button"]');
      assert.notEqual(
        instances.usernamePasswordCredential.name,
        'random string'
      );
      assert.strictEqual(
        find('[name="name"]').value,
        instances.usernamePasswordCredential.name
      );
    });

    test('can cancel changes to existing username & key pair credential', async function (assert) {
      assert.expect(2);
      await visit(urls.usernameKeyPairCredential);
      await click('form [type="button"]', 'Activate edit mode');
      await fillIn('[name="name"]', 'random string');
      await click('.rose-form-actions [type="button"]');
      assert.notEqual(
        instances.usernameKeyPairCredential.name,
        'random string'
      );
      assert.strictEqual(
        find('[name="name"]').value,
        instances.usernameKeyPairCredential.name
      );
    });

    test('saving an existing username & password credential with invalid fields displays error message', async function (assert) {
      assert.expect(2);
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
          }
        );
      });
      await visit(urls.usernamePasswordCredential);
      await click('form [type="button"]', 'Activate edit mode');
      await fillIn('[name="name"]', 'random string');
      await click('[type="submit"]');
      assert.ok(
        find('[role="alert"]').textContent.trim(),
        'Error in provided request.'
      );
      assert.ok(
        find('.rose-form-error-message').textContent.trim(),
        'Name is required.'
      );
    });

    test('saving an existing username & key pair credential with invalid fields displays error message', async function (assert) {
      assert.expect(2);
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
          }
        );
      });
      await visit(urls.usernameKeyPairCredential);
      await click('form [type="button"]', 'Activate edit mode');
      await fillIn('[name="name"]', 'random string');
      await click('[type="submit"]');
      assert.ok(
        find('[role="alert"]').textContent.trim(),
        'Error in provided request.'
      );
      assert.ok(
        find('.rose-form-error-message').textContent.trim(),
        'Name is required.'
      );
    });

    test('can discard unsaved username & password credential changes via dialog', async function (assert) {
      assert.expect(5);
      const confirmService = this.owner.lookup('service:confirm');
      confirmService.enabled = true;
      assert.notEqual(
        instances.usernamePasswordCredential.name,
        'random string'
      );
      await visit(urls.usernamePasswordCredential);
      await click('form [type="button"]', 'Activate edit mode');
      await fillIn('[name="name"]', 'random string');
      assert.strictEqual(currentURL(), urls.usernamePasswordCredential);
      try {
        await visit(urls.credentials);
      } catch (e) {
        assert.ok(find('.rose-dialog'));
        await click('.rose-dialog-footer button:first-child', 'Click Discard');
        assert.strictEqual(currentURL(), urls.credentials);
        assert.notEqual(
          this.server.schema.credentials.where({ type: 'username_password' })
            .models[0].name,
          'random string'
        );
      }
    });

    test('can discard unsaved username & key pair credential changes via dialog', async function (assert) {
      assert.expect(5);
      const confirmService = this.owner.lookup('service:confirm');
      confirmService.enabled = true;
      assert.notEqual(
        instances.usernameKeyPairCredential.name,
        'random string'
      );
      await visit(urls.usernameKeyPairCredential);
      await click('form [type="button"]', 'Activate edit mode');
      await fillIn('[name="name"]', 'random string');
      assert.strictEqual(currentURL(), urls.usernameKeyPairCredential);
      try {
        await visit(urls.credentials);
      } catch (e) {
        assert.ok(find('.rose-dialog'));
        await click('.rose-dialog-footer button:first-child', 'Click Discard');
        assert.strictEqual(currentURL(), urls.credentials);
        assert.notEqual(
          this.server.schema.credentials.where({ type: 'ssh_private_key' })
            .models[0].name,
          'random string'
        );
      }
    });

    test('can cancel discard unsaved username & password credential changes via dialog', async function (assert) {
      assert.expect(5);
      const confirmService = this.owner.lookup('service:confirm');
      confirmService.enabled = true;
      assert.notEqual(
        instances.usernamePasswordCredential.name,
        'random string'
      );
      await visit(urls.usernamePasswordCredential);
      await click('form [type="button"]', 'Activate edit mode');
      await fillIn('[name="name"]', 'random string');
      assert.strictEqual(currentURL(), urls.usernamePasswordCredential);
      try {
        await visit(urls.credentials);
      } catch (e) {
        assert.ok(find('.rose-dialog'));
        await click('.rose-dialog-footer button:last-child', 'Click Cancel');
        assert.strictEqual(currentURL(), urls.usernamePasswordCredential);
        assert.notEqual(
          this.server.schema.credentials.where({ type: 'username_password' })
            .models[0].name,
          'random string'
        );
      }
    });

    test('can cancel discard unsaved username & key pair credential changes via dialog', async function (assert) {
      assert.expect(5);
      const confirmService = this.owner.lookup('service:confirm');
      confirmService.enabled = true;
      assert.notEqual(
        instances.usernameKeyPairCredential.name,
        'random string'
      );
      await visit(urls.usernameKeyPairCredential);
      await click('form [type="button"]', 'Activate edit mode');
      await fillIn('[name="name"]', 'random string');
      assert.strictEqual(currentURL(), urls.usernameKeyPairCredential);
      try {
        await visit(urls.credentials);
      } catch (e) {
        assert.ok(find('.rose-dialog'));
        await click('.rose-dialog-footer button:last-child', 'Click Cancel');
        assert.strictEqual(currentURL(), urls.usernameKeyPairCredential);
        assert.notEqual(
          this.server.schema.credentials.where({ type: 'ssh_private_key' })
            .models[0].name,
          'random string'
        );
      }
    });

    test('password field renders in edit mode only for a username & password credential', async function (assert) {
      assert.expect(3);
      await visit(urls.usernamePasswordCredential);
      assert.notOk(find('[name="password"]'));
      await click('form [type="button"]', 'Activate edit mode');
      assert.strictEqual(currentURL(), urls.usernamePasswordCredential);
      assert.ok(find('[name="password"]'));
    });

    test('private_key and passphrase fields render in edit mode only for a username & key pair credential', async function (assert) {
      assert.expect(5);
      await visit(urls.usernameKeyPairCredential);
      assert.notOk(find('[name="private_key"]'));
      assert.notOk(find('[name="passphrase"]'));
      await click('form [type="button"]', 'Activate edit mode');
      assert.strictEqual(currentURL(), urls.usernameKeyPairCredential);
      assert.ok(find('[name="private_key"]'));
      assert.ok(find('[name="passphrase"]'));
    });
  }
);
