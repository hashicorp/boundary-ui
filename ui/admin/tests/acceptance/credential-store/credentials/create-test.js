import { module, test } from 'qunit';
import { visit, currentURL, find, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { Response } from 'miragejs';

module(
  'Acceptance | credential-stores | credentials | create',
  function (hooks) {
    setupApplicationTest(hooks);
    setupMirage(hooks);

    let getCredentialsCount;

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
      newCredential: null,
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
      // Generate route URLs for resources
      urls.projectScope = `/scopes/${instances.scopes.project.id}`;
      urls.credentialStores = `${urls.projectScope}/credential-stores`;
      urls.staticCredentialStore = `${urls.credentialStores}/${instances.staticCredentialStore.id}`;
      urls.credentials = `${urls.staticCredentialStore}/credentials`;
      urls.newCredential = `${urls.staticCredentialStore}/credentials/new`;
      // Generate resource counter
      getCredentialsCount = () => {
        return this.server.schema.credentials.all().models.length;
      };
      authenticateSession({});
    });

    test('Users can create a new credential', async function (assert) {
      assert.expect(1);
      const credentialsCount = getCredentialsCount();
      await visit(urls.newCredential);
      await fillIn('[name="name"]', 'random string');
      await click('[type="submit"]');
      assert.strictEqual(getCredentialsCount(), credentialsCount + 1);
    });

    test('Users can cancel create new credential', async function (assert) {
      assert.expect(2);
      const credentialsCount = getCredentialsCount();
      await visit(urls.newCredential);
      await fillIn('[name="name"]', 'random string');
      await click('.rose-form-actions [type="button"]');
      assert.strictEqual(currentURL(), urls.credentials);
      assert.strictEqual(getCredentialsCount(), credentialsCount);
    });

    test('Users cannot navigate to new credential route without proper authorization', async function (assert) {
      assert.expect(2);
      instances.staticCredentialStore.authorized_collection_actions[
        'credentials'
      ] = [];
      await visit(urls.staticCredentialStore);
      assert.notOk(
        instances.staticCredentialStore.authorized_collection_actions.credentials.includes(
          'create'
        )
      );
      assert.notOk(find(`[href="${urls.newCredential}"]`));
    });

    test('saving a new credential with invalid fields displays error messages', async function (assert) {
      assert.expect(2);
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
          }
        );
      });
      await visit(urls.newCredential);
      await click('[type="submit"]');
      assert.ok(
        find('[role="alert"]').textContent.trim(),
        'Error in provided request.'
      );
      assert.ok(
        find('.rose-form-error-message').textContent.trim(),
        'Field required for creating a username-password credential.'
      );
    });
  }
);
