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
    };

    const urls = {
      projectScope: null,
      credentialStores: null,
      staticCredentialStore: null,
      credentials: null,
      credential: null,
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
      instances.credential = this.server.create('credential', {
        scope: instances.scopes.project,
        credentialStore: instances.staticCredentialStore,
        type: 'username_password',
      });
      // Generate route URLs for resources
      urls.projectScope = `/scopes/${instances.scopes.project.id}`;
      urls.credentialStores = `${urls.projectScope}/credential-stores`;
      urls.staticCredentialStore = `${urls.credentialStores}/${instances.staticCredentialStore.id}`;
      urls.credentials = `${urls.staticCredentialStore}/credentials`;
      urls.credential = `${urls.credentials}/${instances.credential.id}`;
      authenticateSession({});
    });

    test('can save changes to existing credential', async function (assert) {
      assert.expect(3);
      assert.notEqual(instances.credential.name, 'random string');
      await visit(urls.credential);
      await click('form [type="button"]', 'Activate edit mode');
      await fillIn('[name="name"]', 'random string');
      await click('.rose-form-actions [type="submit"]');
      assert.strictEqual(currentURL(), urls.credential);
      assert.strictEqual(
        this.server.schema.credentials.all().models[0].name,
        'random string'
      );
    });

    test('cannot make changes to an existing credential without proper authorization', async function (assert) {
      assert.expect(1);
      instances.credential.authorized_actions =
        instances.credential.authorized_actions.filter(
          (item) => item !== 'update'
        );
      await visit(urls.credential);
      assert.notOk(find('.rose-layout-page-actions .rose-button-secondary'));
    });

    test('can cancel changes to existing credential', async function (assert) {
      assert.expect(2);
      await visit(urls.credential);
      await click('form [type="button"]', 'Activate edit mode');
      await fillIn('[name="name"]', 'random string');
      await click('.rose-form-actions [type="button"]');
      assert.notEqual(instances.credential.name, 'random string');
      assert.strictEqual(
        find('[name="name"]').value,
        instances.credential.name
      );
    });

    test('saving an existing credential with invalid fields displays error message', async function (assert) {
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
      await visit(urls.credential);
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

    test('can discard unsaved credential changes via dialog', async function (assert) {
      assert.expect(5);
      const confirmService = this.owner.lookup('service:confirm');
      confirmService.enabled = true;
      assert.notEqual(instances.credential.name, 'random string');
      await visit(urls.credential);
      await click('form [type="button"]', 'Activate edit mode');
      await fillIn('[name="name"]', 'random string');
      assert.strictEqual(currentURL(), urls.credential);
      try {
        await visit(urls.credentials);
      } catch (e) {
        assert.ok(find('.rose-dialog'));
        await click('.rose-dialog-footer button:first-child', 'Click Discard');
        assert.strictEqual(currentURL(), urls.credentials);
        assert.notEqual(
          this.server.schema.credentials.all().models[0].name,
          'random string'
        );
      }
    });

    test('can cancel discard unsaved credential changes via dialog', async function (assert) {
      assert.expect(5);
      const confirmService = this.owner.lookup('service:confirm');
      confirmService.enabled = true;
      assert.notEqual(instances.credential.name, 'random string');
      await visit(urls.credential);
      await click('form [type="button"]', 'Activate edit mode');
      await fillIn('[name="name"]', 'random string');
      assert.strictEqual(currentURL(), urls.credential);
      try {
        await visit(urls.credentials);
      } catch (e) {
        assert.ok(find('.rose-dialog'));
        await click('.rose-dialog-footer button:last-child', 'Click Cancel');
        assert.strictEqual(currentURL(), urls.credential);
        assert.notEqual(
          this.server.schema.credentials.all().models[0].name,
          'random string'
        );
      }
    });
  }
);
