import { module, test } from 'qunit';
import {
  visit,
  click,
  fillIn,
  currentURL,
  find,
  select,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { Response } from 'miragejs';
import { TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERT } from 'api/models/credential-library';

module('Acceptance | credential-libraries | create', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let getCredentialLibraryCount;

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
    credentialLibrary: null,
    credentialLibraries: null,
    newCredentialLibrary: null,
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
    instances.credentialLibrary = this.server.create('credential-library', {
      scope: instances.scopes.project,
      credentialStore: instances.credentialStore,
      http_method: 'GET',
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.credentialStores = `${urls.projectScope}/credential-stores`;
    urls.credentialStore = `${urls.credentialStores}/${instances.credentialStore.id}`;
    urls.credentialLibraries = `${urls.credentialStore}/credential-libraries`;
    urls.credentialLibrary = `${urls.credentialLibraries}/${instances.credentialLibrary.id}`;
    urls.newCredentialLibrary = `${urls.credentialLibraries}/new`;
    // Generate resource counter
    getCredentialLibraryCount = () =>
      this.server.schema.credentialLibraries.all().models.length;
    authenticateSession({});
  });
  test('visiting credential libraries', async function (assert) {
    assert.expect(2);
    await visit(urls.credentialLibraries);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.credentialLibraries);
    await visit(urls.credentialLibrary);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.credentialLibrary);
  });

  test('can create a credential library', async function (assert) {
    assert.expect(1);
    const count = getCredentialLibraryCount();
    await visit(urls.newCredentialLibrary);
    await fillIn('[name="name"]', 'random string');
    await click('[type="submit"]');
    assert.strictEqual(getCredentialLibraryCount(), count + 1);
  });

  test('can create a new credential library of type vault ssh cert', async function (assert) {
    assert.expect(12);
    const count = getCredentialLibraryCount();
    await visit(urls.newCredentialLibrary);
    await click('[value="vault-ssh-cert"]');
    await fillIn('[name="name"]', 'name');
    await fillIn('[name="description"]', 'description');
    await fillIn('[name="vault_path"]', 'path');
    await fillIn('[name="username"]', 'username');
    await select('[name="key_type"]', 'rsa');
    await fillIn('[name="key_bits"]', 100);
    await fillIn('[name="ttl"]', 'ttl');
    await fillIn('[name="key_id"]', 'key_id');
    await fillIn(
      '[name="critical_options"] tbody td:nth-of-type(1) input',
      'co_key'
    );
    await fillIn(
      '[name="critical_options"] tbody td:nth-of-type(2) input',
      'co_value'
    );
    await click('[name="critical_options"] button');
    await fillIn(
      '[name="extensions"] tbody td:nth-of-type(1) input',
      'ext_key'
    );
    await fillIn(
      '[name="extensions"] tbody td:nth-of-type(2) input',
      'ext_value'
    );
    await click('[name="extensions"] button');
    await click('[type="submit"]');
    assert.strictEqual(getCredentialLibraryCount(), count + 1);
    assert.strictEqual(
      this.server.schema.credentialLibraries.where({
        type: TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERT,
      }).length,
      1
    );
    const credentialLibrary = this.server.schema.credentialLibraries.findBy({
      type: TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERT,
    });
    assert.strictEqual(credentialLibrary.name, 'name');
    assert.strictEqual(credentialLibrary.description, 'description');
    assert.strictEqual(credentialLibrary.attributes.path, 'path');
    assert.strictEqual(credentialLibrary.attributes.username, 'username');
    assert.strictEqual(credentialLibrary.attributes.key_type, 'rsa');
    assert.strictEqual(credentialLibrary.attributes.key_bits, 100);
    assert.strictEqual(credentialLibrary.attributes.ttl, 'ttl');
    assert.strictEqual(credentialLibrary.attributes.key_id, 'key_id');
    assert.deepEqual(credentialLibrary.attributes.critical_options, {
      co_key: 'co_value',
    });
    assert.deepEqual(credentialLibrary.attributes.extensions, {
      ext_key: 'ext_value',
    });
  });

  test('ecdsa and rsa key types bring up a key bits field', async function (assert) {
    assert.expect(3);
    await visit(urls.newCredentialLibrary);
    await click('[value="vault-ssh-cert"]');
    await select('[name="key_type"]', 'ed25519');
    assert.dom('[name="key_bits"]').doesNotExist();
    await select('[name="key_type"]', 'ecdsa');
    assert.dom('[name="key_bits"]').isVisible();
    await select('[name="key_type"]', 'rsa');
    assert.dom('[name="key_bits"]').isVisible();
  });

  test('Users cannot navigate to new credential library route without proper authorization', async function (assert) {
    assert.expect(2);
    instances.credentialStore.authorized_collection_actions[
      'credential-libraries'
    ] = [];
    await visit(urls.credentialLibraries);
    assert.notOk(
      instances.credentialStore.authorized_collection_actions[
        'credential-libraries'
      ].includes('create')
    );
    assert.notOk(find(`[href="${urls.newCredentialLibrary}"]`));
  });

  test('can cancel create a new credential library', async function (assert) {
    assert.expect(2);
    const count = getCredentialLibraryCount();
    await visit(urls.newCredentialLibrary);
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="button"]');
    assert.strictEqual(currentURL(), urls.credentialLibraries);
    assert.strictEqual(getCredentialLibraryCount(), count);
  });

  test('saving a new credential library with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.post('/credential-libraries', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid',
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
    await visit(urls.newCredentialLibrary);
    await click('[type="submit"]');
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'The request was invalid.'
    );
    assert.ok(
      find('.hds-form-error__message').textContent.trim(),
      'Name is required.'
    );
  });

  test('cannot select vault ssh cert when feature is disabled', async function (assert) {
    const featuresService = this.owner.lookup('service:features');
    featuresService.disable('credential-library-vault-ssh-cert');
    assert.expect(1);
    await visit(urls.newCredentialLibrary);

    assert.dom('[value="vault-ssh-cert"]').doesNotExist();
  });
});
