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
    credentialStore: null,
    unknownCredentialStore: null,
    newCredentialStore: null,
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
    instances.credentialStore = this.server.create('credential-store', {
      scope: instances.scopes.project,
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.credentialStores = `${urls.projectScope}/credential-stores`;
    urls.credentialStore = `${urls.credentialStores}/${instances.credentialStore.id}`;
    urls.unknownCredentialStore = `${urls.credentialStores}/foo`;
    urls.newCredentialStore = `${urls.credentialStores}/new`;
    authenticateSession({});
  });

  test('can save changes to existing credential store', async function (assert) {
    assert.expect(3);
    assert.notEqual(instances.credentialStore.name, 'random string');
    await visit(urls.credentialStore);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="submit"]');
    assert.equal(currentURL(), urls.credentialStore);
    assert.equal(
      this.server.schema.credentialStores.all().models[0].name,
      'random string'
    );
  });

  test('cannot make changes to an existing credential store without proper authorization', async function (assert) {
    assert.expect(1);
    instances.credentialStore.authorized_actions =
      instances.credentialStore.authorized_actions.filter(
        (item) => item !== 'update'
      );
    await visit(urls.credentialStore);
    assert.notOk(find('.rose-layout-page-actions .rose-button-secondary'));
  });

  test('can cancel changes to existing credential store', async function (assert) {
    assert.expect(2);
    await visit(urls.credentialStore);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="button"]');
    assert.notEqual(instances.credentialStore.name, 'random string');
    assert.equal(find('[name="name"]').value, instances.credentialStore.name);
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
    await visit(urls.credentialStore);
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
    assert.notEqual(instances.credentialStore.name, 'random string');

    await visit(urls.credentialStore);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    assert.equal(currentURL(), urls.credentialStore);

    try {
      await visit(urls.credentialStores);
    } catch (e) {
      assert.ok(find('.rose-dialog'));
      await click('.rose-dialog-footer button:first-child', 'Click Discard');
      assert.equal(currentURL(), urls.credentialStores);
      assert.notEqual(
        this.server.schema.credentialStores.all().models[0].name,
        'random string'
      );
    }
  });

  test('can cancel discard unsaved credential store via dialog', async function (assert) {
    assert.expect(5);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.credentialStore.name, 'random string');
    await visit(urls.credentialStore);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    assert.equal(currentURL(), urls.credentialStore);

    try {
      await visit(urls.credentialStores);
    } catch (e) {
      assert.ok(find('.rose-dialog'));
      await click('.rose-dialog-footer button:last-child');
      assert.equal(currentURL(), urls.credentialStore);
      assert.notEqual(
        this.server.schema.credentialStores.all().models[0].name,
        'random string'
      );
    }
  });
});
