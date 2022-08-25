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

    let getUsernamePasswordCredentialCount;
    let getUsernameKeyPairCredentialCount;

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
      authenticateSession({});
    });

    test('can delete username & password credential', async function (assert) {
      assert.expect(2);
      const usernamePasswordCredentialCount =
        getUsernamePasswordCredentialCount();
      await visit(urls.usernamePasswordCredential);
      await click('.rose-layout-page-actions .rose-dropdown-button-danger');
      assert.strictEqual(currentURL(), urls.credentials);
      assert.strictEqual(
        getUsernamePasswordCredentialCount(),
        usernamePasswordCredentialCount - 1
      );
    });

    test('can delete username & key pair credential', async function (assert) {
      assert.expect(2);
      const usernameKeyPairCredentialCount =
        getUsernameKeyPairCredentialCount();
      await visit(urls.usernameKeyPairCredential);
      await click('.rose-layout-page-actions .rose-dropdown-button-danger');
      assert.strictEqual(currentURL(), urls.credentials);
      assert.strictEqual(
        getUsernameKeyPairCredentialCount(),
        usernameKeyPairCredentialCount - 1
      );
    });

    test('cannot delete a username & password credential without proper authorization', async function (assert) {
      assert.expect(3);
      const usernamePasswordCredentialCount =
        getUsernamePasswordCredentialCount();
      instances.usernamePasswordCredential.authorized_actions =
        instances.usernamePasswordCredential.authorized_actions.filter(
          (item) => item !== 'delete'
        );
      await visit(urls.usernamePasswordCredential);
      assert.strictEqual(currentURL(), urls.usernamePasswordCredential);
      assert.notOk(
        find('.rose-layout-page-actions .rose-dropdown-button-danger')
      );
      assert.strictEqual(
        getUsernamePasswordCredentialCount(),
        usernamePasswordCredentialCount
      );
    });

    test('cannot delete a username & key pair credential without proper authorization', async function (assert) {
      assert.expect(3);
      const usernameKeyPairCredentialCount =
        getUsernameKeyPairCredentialCount();
      instances.usernameKeyPairCredential.authorized_actions =
        instances.usernameKeyPairCredential.authorized_actions.filter(
          (item) => item !== 'delete'
        );
      await visit(urls.usernameKeyPairCredential);
      assert.strictEqual(currentURL(), urls.usernameKeyPairCredential);
      assert.notOk(
        find('.rose-layout-page-actions .rose-dropdown-button-danger')
      );
      assert.strictEqual(
        getUsernamePasswordCredentialCount(),
        usernameKeyPairCredentialCount
      );
    });

    test('can accept delete username & password credential via dialog', async function (assert) {
      assert.expect(2);
      const confirmService = this.owner.lookup('service:confirm');
      confirmService.enabled = true;
      confirmService.confirm = sinon.fake.returns(resolve());
      const usernamePasswordCredentialCount =
        getUsernamePasswordCredentialCount();
      await visit(urls.usernamePasswordCredential);
      await click('.rose-layout-page-actions .rose-dropdown-button-danger');
      assert.strictEqual(
        getUsernamePasswordCredentialCount(),
        usernamePasswordCredentialCount - 1
      );
      assert.ok(confirmService.confirm.calledOnce);
    });

    test('can accept delete username & key pair credential via dialog', async function (assert) {
      assert.expect(2);
      const confirmService = this.owner.lookup('service:confirm');
      confirmService.enabled = true;
      confirmService.confirm = sinon.fake.returns(resolve());
      const usernameKeyPairCredentialCount =
        getUsernameKeyPairCredentialCount();
      await visit(urls.usernameKeyPairCredential);
      await click('.rose-layout-page-actions .rose-dropdown-button-danger');
      assert.strictEqual(
        getUsernameKeyPairCredentialCount(),
        usernameKeyPairCredentialCount - 1
      );
      assert.ok(confirmService.confirm.calledOnce);
    });

    test('cannot cancel delete username & password credential via dialog', async function (assert) {
      assert.expect(2);
      const confirmService = this.owner.lookup('service:confirm');
      confirmService.enabled = true;
      confirmService.confirm = sinon.fake.returns(reject());
      const usernamePasswordCredentialCount =
        getUsernamePasswordCredentialCount();
      await visit(urls.usernamePasswordCredential);
      await click('.rose-layout-page-actions .rose-dropdown-button-danger');
      assert.strictEqual(
        getUsernamePasswordCredentialCount(),
        usernamePasswordCredentialCount
      );
      assert.ok(confirmService.confirm.calledOnce);
    });

    test('cannot cancel delete username & key pair credential via dialog', async function (assert) {
      assert.expect(2);
      const confirmService = this.owner.lookup('service:confirm');
      confirmService.enabled = true;
      confirmService.confirm = sinon.fake.returns(reject());
      const usernameKeyPairCredentialCount =
        getUsernameKeyPairCredentialCount();
      await visit(urls.usernameKeyPairCredential);
      await click('.rose-layout-page-actions .rose-dropdown-button-danger');
      assert.strictEqual(
        getUsernameKeyPairCredentialCount(),
        usernameKeyPairCredentialCount
      );
      assert.ok(confirmService.confirm.calledOnce);
    });

    test('deleting a username & password credential which errors displays error message', async function (assert) {
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
      await visit(urls.usernamePasswordCredential);
      await click('.rose-layout-page-actions .rose-dropdown-button-danger');
      assert.ok(find('[role="alert"]').textContent.trim(), 'Oops.');
    });

    test('deleting a username & key pair credential which errors displays error message', async function (assert) {
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
      await visit(urls.usernameKeyPairCredential);
      await click('.rose-layout-page-actions .rose-dropdown-button-danger');
      assert.ok(find('[role="alert"]').textContent.trim(), 'Oops.');
    });
  }
);
