import { module, test } from 'qunit';
import { visit, click, fillIn, currentURL, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { Response } from 'miragejs';
import { resolve, reject } from 'rsvp';
import sinon from 'sinon';

module('Acceptance | credential-library', function (hooks) {
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
    unknownCredentialLibrary: null,
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
    urls.unknownCredentialLibrary = `${urls.credentialLibraries}/foo`;
    // Generate resource counter
    getCredentialLibraryCount = () =>
      this.server.schema.credentialLibraries.all().models.length;
    authenticateSession({});
  });

  test('visiting credential libraries', async function (assert) {
    assert.expect(2);
    await visit(urls.credentialLibraries);
    await a11yAudit();
    assert.equal(currentURL(), urls.credentialLibraries);
    await visit(urls.credentialLibrary);
    await a11yAudit();
    assert.equal(currentURL(), urls.credentialLibrary);
  });

  test('visiting an unknown credential library displays 404 message', async function (assert) {
    assert.expect(1);
    await visit(urls.unknownCredentialLibrary);
    await a11yAudit();
    console.debug(find('.rose-message-subtitle'));
    assert.ok(find('.rose-message-subtitle').textContent.trim(), 'Error 404');
  });

  test('can create a credential library', async function (assert) {
    assert.expect(1);
    const count = getCredentialLibraryCount();
    await visit(urls.newCredentialLibrary);
    await fillIn('[name="name"]', 'random string');
    await click('[type="submit"]');
    assert.equal(getCredentialLibraryCount(), count + 1);
  });

  test('can cancel create a new credential library', async function (assert) {
    assert.expect(2);
    const count = getCredentialLibraryCount();
    await visit(urls.newCredentialLibrary);
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="button"]');
    assert.equal(currentURL(), urls.credentialLibraries);
    assert.equal(getCredentialLibraryCount(), count);
  });

  test('saving a new credential library with invalid fields displays error messasges', async function (assert) {
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
      find('.rose-form-error-message').textContent.trim(),
      'Name is required.'
    );
  });

  test('can delete credential library', async function (assert) {
    assert.expect(1);
    const count = getCredentialLibraryCount();
    await visit(urls.credentialLibrary);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.equal(getCredentialLibraryCount(), count - 1);
  });

  test('can accept delete credential library via dialog', async function (assert) {
    assert.expect(2);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    confirmService.confirm = sinon.fake.returns(resolve());
    const count = getCredentialLibraryCount();
    await visit(urls.credentialLibrary);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.equal(getCredentialLibraryCount(), count - 1);
    assert.ok(confirmService.confirm.calledOnce);
  });

  test('cannot cancel delete credential library via dialog', async function (assert) {
    assert.expect(2);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    confirmService.confirm = sinon.fake.returns(reject());
    const count = getCredentialLibraryCount();
    await visit(urls.credentialLibrary);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.equal(getCredentialLibraryCount(), count);
    assert.ok(confirmService.confirm.calledOnce);
  });

  test('deleting a credential library which errors displays error messages', async function (assert) {
    assert.expect(1);
    this.server.del('/credential-libraries/:id', () => {
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
    await visit(urls.credentialLibrary);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.ok(find('[role="alert"]').textContent.trim(), 'Oops.');
  });
});
