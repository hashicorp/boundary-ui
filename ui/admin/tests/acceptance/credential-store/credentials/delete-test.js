import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { click, currentURL, visit, find } from '@ember/test-helpers';
import { resolve, reject } from 'rsvp';
import sinon from 'sinon';
import { Response } from 'miragejs';

module(
  'Acceptance | credential-stores | credentials | delete',
  function (hooks) {
    setupApplicationTest(hooks);
    setupMirage(hooks);

    let getCredentialsCount;

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
      credential: null,
    };

    hooks.beforeEach(function () {
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
      // Generate resource counter
      getCredentialsCount = () => {
        return this.server.schema.credentials.all().models.length;
      };
      authenticateSession({});
    });

    test('can delete credential', async function (assert) {
      assert.expect(2);
      const credentialsCount = getCredentialsCount();
      await visit(urls.credential);
      await click('.rose-layout-page-actions .rose-dropdown-button-danger');
      assert.strictEqual(currentURL(), urls.credentials);
      assert.strictEqual(getCredentialsCount(), credentialsCount - 1);
    });

    test('cannot delete a credential store without proper authorization', async function (assert) {
      assert.expect(2);
      const credentialsCount = getCredentialsCount();
      instances.credential.authorized_actions =
        instances.credential.authorized_actions.filter(
          (item) => item !== 'delete'
        );
      await visit(urls.credential);
      assert.strictEqual(currentURL(), urls.credential);
      assert.notOk(
        find('.rose-layout-page-actions .rose-dropdown-button-danger')
      );
      assert.strictEqual(getCredentialsCount(), credentialsCount);
    });

    test('can accept delete credential via dialog', async function (assert) {
      assert.expect(2);
      const confirmService = this.owner.lookup('service:confirm');
      confirmService.enabled = true;
      confirmService.confirm = sinon.fake.returns(resolve());
      const credentialsCount = getCredentialsCount();
      await visit(urls.credential);
      await click('.rose-layout-page-actions .rose-dropdown-button-danger');
      assert.strictEqual(getCredentialsCount(), credentialsCount - 1);
      assert.ok(confirmService.confirm.calledOnce);
    });

    test('cannot cancel delete credential via dialog', async function (assert) {
      assert.expect(2);
      const confirmService = this.owner.lookup('service:confirm');
      confirmService.enabled = true;
      confirmService.confirm = sinon.fake.returns(reject());
      const credentialsCount = getCredentialsCount();
      await visit(urls.credential);
      await click('.rose-layout-page-actions .rose-dropdown-button-danger');
      assert.strictEqual(getCredentialsCount(), credentialsCount);
      assert.ok(confirmService.confirm.calledOnce);
    });

    test('deleting a credential which errors displays error message', async function (assert) {
      assert.expect(1);
      this.server.del('/credentials/:id', () => {
        return new Response(
          490,
          {},
          {
            status: 490,
            code: 'error',
            message: 'Oops.',
          }
        );
      });
      await visit(urls.credential);
      await click('.rose-layout-page-actions .rose-dropdown-button-danger');
      assert.ok(find('[role="alert"]').textContent.trim(), 'Oops.');
    });
  }
);
