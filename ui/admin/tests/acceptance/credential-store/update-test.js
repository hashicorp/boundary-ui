import { module, test } from 'qunit';
import { visit, currentURL, find, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { Response } from 'miragejs';

module('Acceptance | credential-stores | update', function (hooks) {
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
    globalScope: null,
    orgScope: null,
    projectScope: null,
    credentialStores: null,
    staticCredentialStore: null,
    vaultCredentialStore: null,
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
    instances.vaultCredentialStore = this.server.create('credential-store', {
      scope: instances.scopes.project,
      type: 'vault',
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.credentialStores = `${urls.projectScope}/credential-stores`;
    urls.vaultCredentialStore = `${urls.credentialStores}/${instances.vaultCredentialStore.id}`;
    urls.staticCredentialStore = `${urls.credentialStores}/${instances.staticCredentialStore.id}`;
    authenticateSession({});
  });

  test('can save changes to existing static credential store', async function (assert) {
    assert.expect(3);
    assert.notEqual(instances.staticCredentialStore.name, 'random string');
    await visit(urls.staticCredentialStore);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="submit"]');
    assert.strictEqual(currentURL(), urls.staticCredentialStore);
    assert.strictEqual(
      this.server.schema.credentialStores.where({ type: 'static' }).models[0]
        .name,
      'random string'
    );
  });

  test('can save changes to existing vault credential store', async function (assert) {
    assert.expect(3);
    assert.notEqual(instances.vaultCredentialStore.name, 'random string');
    await visit(urls.vaultCredentialStore);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'vault cred. store');
    await click('.rose-form-actions [type="submit"]');
    assert.strictEqual(currentURL(), urls.vaultCredentialStore);
    assert.strictEqual(
      this.server.schema.credentialStores.where({ type: 'vault' }).models[0]
        .name,
      'vault cred. store'
    );
  });

  test('cannot make changes to an existing credential store without proper authorization', async function (assert) {
    assert.expect(1);
    instances.staticCredentialStore.authorized_actions =
      instances.staticCredentialStore.authorized_actions.filter(
        (item) => item !== 'update'
      );
    await visit(urls.staticCredentialStore);
    assert.notOk(find('.rose-layout-page-actions .rose-button-secondary'));
  });

  test('can cancel changes to existing credential store', async function (assert) {
    assert.expect(2);
    await visit(urls.staticCredentialStore);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="button"]');
    assert.notEqual(instances.staticCredentialStore.name, 'random string');
    assert.strictEqual(
      find('[name="name"]').value,
      instances.staticCredentialStore.name
    );
  });

  test('saving an existing credential store with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.patch('/credential-stores/:id', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
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
    await visit(urls.staticCredentialStore);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('[type="submit"]');
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'The request was invalid.'
    );
    assert.ok(
      find('.rose-form-error-message').textContent.trim(),
      'Name is required.'
    );
  });

  test('can discard unsaved credential store changes via dialog', async function (assert) {
    assert.expect(5);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.staticCredentialStore.name, 'random string');

    await visit(urls.staticCredentialStore);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    assert.strictEqual(currentURL(), urls.staticCredentialStore);

    try {
      await visit(urls.credentialStores);
    } catch (e) {
      assert.ok(find('.rose-dialog'));
      await click('.rose-dialog-footer button:first-child', 'Click Discard');
      assert.strictEqual(currentURL(), urls.credentialStores);
      assert.notEqual(
        this.server.schema.credentialStores.where({ type: 'static' }).models[0]
          .name,
        'random string'
      );
    }
  });

  test('can cancel discard unsaved static credential store via dialog', async function (assert) {
    assert.expect(5);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.staticCredentialStore.name, 'random string');
    await visit(urls.staticCredentialStore);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    assert.strictEqual(currentURL(), urls.staticCredentialStore);

    try {
      await visit(urls.credentialStores);
    } catch (e) {
      assert.ok(find('.rose-dialog'));
      await click('.rose-dialog-footer button:last-child');
      assert.strictEqual(currentURL(), urls.staticCredentialStore);
      assert.notEqual(
        this.server.schema.credentialStores.where({ type: 'static' }).models[0]
          .name,
        'random string'
      );
    }
  });
});
