import { module, test } from 'qunit';
import { visit, find, findAll, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | targets | injected application credential sources', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let getCredentialLibraryCount;
  let getCredentialCount;
  let credentialSourceCount;
  let randomlySelectedCredentialLibraries;
  let randomlySelectedCredentials;

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    vaultCredentialStore: null,
    staticCredentialStore: null,
    credentialLibraries: null,
    credentialLibrary: null,
    credentials: null,
    credential: null,
  };
  const urls = {
    globalScope: null,
    orgScope: null,
    projectScope: null,
    targets: null,
    target: null,
    credentialLibraries: null,
    credentialLibrary: null,
    addInjectedApplicationCredentialSources: null,
    injectedApplicationCredentialSources: null,
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
    instances.vaultCredentialStore = this.server.create('credential-store', {
      type: 'vault',
      scope: instances.scopes.project,
    });
    instances.staticCredentialStore = this.server.create('credential-store', {
      type: 'static',
      scope: instances.scopes.project,
    });
    instances.credentials = this.server.createList('credential', 2, {
      scope: instances.scopes.project,
      credentialStore: instances.staticCredentialStore,
    });
    instances.credentialLibraries = this.server.createList(
      'credential-library',
      2,
      {
        scope: instances.scopes.project,
        credentialStore: instances.vaultCredentialStore,
      }
    );
    instances.credentialLibrary = instances.credentialLibraries[0];
    instances.credential = instances.credentials[0];
    instances.target = this.server.create('target', {
      scope: instances.scopes.project,
      type: 'ssh'
    });

    randomlySelectedCredentials = this.server.schema.credentials
      .all()
      .models.filter(Boolean)
      .map((cred) => cred.id);
    randomlySelectedCredentialLibraries = this.server.schema.credentialLibraries
      .all()
      .models.filter(Boolean)
      .map((cred) => cred.id);

    instances.target.update({
      injectedApplicationCredentialSourceIds: [
        ...randomlySelectedCredentialLibraries,
        ...randomlySelectedCredentials,
      ],
    });

    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.targets = `${urls.projectScope}/targets`;
    urls.target = `${urls.targets}/${instances.target.id}`;
    urls.injectedApplicationCredentialSources = `${urls.target}/injection-application-credential-sources`;
    urls.credentialLibrary = `${urls.projectScope}/credential-stores/${instances.credentialLibrary.credentialStoreId}/credential-libraries/${instances.credentialLibrary.id}`;
    urls.credential = `${urls.projectScope}/credential-stores/${instances.credential.credentialStoreId}/credentials/${instances.credential.id}`;
    urls.addInjectedApplicationCredentialSources = `${urls.target}/add-injected-application-credential-sources`;
    getCredentialLibraryCount = () =>
      this.server.schema.credentialLibraries.all().models.length;
    getCredentialCount = () =>
      this.server.schema.credentials.all().models.length;
    credentialSourceCount = getCredentialLibraryCount() + getCredentialCount();

    authenticateSession({});
  });

  test('visiting target injected application credential sources', async function (assert) {
    assert.expect(2);
    await visit(urls.injectedApplicationCredentialSources);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.injectedApplicationCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialSourceCount);
  });

  test('can navigate to a vault type credential library', async function (assert) {
    assert.expect(1);
    await visit(urls.injectedApplicationCredentialSources);
    await click('main tbody .rose-table-header-cell:nth-child(1) a');
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.credentialLibrary);
  });

  test('can navigate to a username & password type credential', async function (assert) {
    assert.expect(1);
    instances.target.update({
      injectedApplicationCredentialSourceIds: [...randomlySelectedCredentials],
    });
    await visit(urls.injectedApplicationCredentialSources);
    await click('main tbody .rose-table-header-cell:nth-child(1) a');
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.credential);
  });

  test('visiting add injected application credential sources', async function (assert) {
    assert.expect(1);
    await visit(urls.addInjectedApplicationCredentialSources);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.addInjectedApplicationCredentialSources);
  });

  test('displays list of all injected application credential source types available', async function (assert) {
    assert.expect(2);
    instances.target.update({
      injectedApplicationCredentialSourceIds: [],
    });
    await visit(urls.addInjectedApplicationCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialSourceCount);
    assert.dom('.rose-message-title').doesNotExist();
  });

  test('displays list of injected application credential sources with only credential libraries available', async function (assert) {
    assert.expect(2);
    instances.target.update({
      injectedApplicationCredentialSourceIds: [...randomlySelectedCredentialLibraries],
    });
    await visit(urls.addInjectedApplicationCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, getCredentialLibraryCount());
    assert.dom('.rose-message-title').doesNotExist();
  });

  test('displays no injected application credential sources message when none available', async function (assert) {
    assert.expect(1);
    await visit(urls.addInjectedApplicationCredentialSources);
    assert.strictEqual(
      find('.rose-message-title').textContent.trim(),
      'No injected application Credential Sources Available'
    );
  });

  test('when no injected application credential sources available, button routes to add injected application credential sources', async function (assert) {
    assert.expect(1);
    instances.target.update({
        injectedApplicationCredentialSourceIds: [],
    });
    await visit(urls.injectedApplicationCredentialSources);
    await click(find('.rose-message-link'));
    assert.strictEqual(currentURL(), urls.addInjectedApplicationCredentialSources);
  });

  test('can select and save a vault type credential library to add', async function (assert) {
    assert.expect(4);
    instances.target.update({
        injectedApplicationCredentialSourceIds: [],
    });
    await visit(urls.injectedApplicationCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, 0);
    await visit(urls.addInjectedApplicationCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialSourceCount);
    await click('tbody tr:first-child label');
    await click('form [type="submit"]');
    assert.strictEqual(currentURL(), urls.injectedApplicationCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, 1);
  });

  test('can select and save a username & password type credential to add', async function (assert) {
    assert.expect(4);
    instances.target.update({
      injectedApplicationCredentialSourceIds: [],
    });
    await visit(urls.injectedApplicationCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, 0);
    await visit(urls.addInjectedApplicationCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialSourceCount);
    await click('tbody tr:last-child label');
    await click('form [type="submit"]');
    assert.strictEqual(currentURL(), urls.injectedApplicationCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, 1);
  });

  test('can select and save both a credential-library and a credential to add', async function (assert) {
    assert.expect(4);
    instances.target.update({
      injectedApplicationCredentialSourceIds: [],
    });
    await visit(urls.injectedApplicationCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, 0);
    await visit(urls.addInjectedApplicationCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialSourceCount);
    await click('tbody tr:last-child label');
    await click('tbody tr:first-child label');
    await click('form [type="submit"]');
    assert.strictEqual(currentURL(), urls.injectedApplicationCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, 2);
  });

  test('cannot add credential sources without proper authorization', async function (assert) {
    assert.expect(1);
    instances.target.authorized_actions =
      instances.target.authorized_actions.filter(
        (item) => item !== 'add-credential-sources'
      );
    await visit(urls.injectedApplicationCredentialSources);
    assert.dom(`[href="${urls.addInjectedApplicationCredentialSources}"]`).doesNotExist();
  });

  test('can select and cancel credential sources to add', async function (assert) {
    assert.expect(4);
    instances.target.update({
      injectedApplicationCredentialSourceIds: [],
    });
    await visit(urls.injectedApplicationCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, 0);
    await visit(urls.addInjectedApplicationCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialSourceCount);
    await click('tbody label');
    await click('form [type="button"]');
    assert.strictEqual(currentURL(), urls.injectedApplicationCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, 0);
  });

  test('can select multiple injected application credential sources to add and cancel', async function (assert) {
    assert.expect(4);
    instances.target.update({
      injectedApplicationCredentialSourceIds: [],
    });
    await visit(urls.injectedApplicationCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, 0);
    await visit(urls.addInjectedApplicationCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialSourceCount);
    await click('tbody tr:last-child label');
    await click('tbody tr:first-child label');
    await click('form [type="button"]');
    assert.strictEqual(currentURL(), urls.injectedApplicationCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, 0);
  });

  test('adding credential sources which errors displays error message', async function (assert) {
    assert.expect(1);
    this.server.post('/targets/:idMethod', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {},
        }
      );
    });
    instances.target.update({
      injectedApplicationCredentialSourceIds: [],
    });
    await visit(urls.addInjectedApplicationCredentialSources);
    await click('tbody tr:last-child label');
    await click('tbody tr:first-child label');
    await click('form [type="submit"]');
    assert.dom('[role="alert"]').isVisible();
  });

  test('can remove a vault type credential library', async function (assert) {
    assert.expect(3);
    instances.target.update({
      injectedApplicationCredentialSourceIds: [...randomlySelectedCredentialLibraries],
    });
    const credentialLibraryCount = getCredentialLibraryCount();
    await visit(urls.injectedApplicationCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialLibraryCount);
    await click('tbody tr .rose-dropdown-button-danger');
    assert.strictEqual(findAll('tbody tr').length, credentialLibraryCount - 1);
    await visit(urls.addInjectedApplicationCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialLibraryCount + 1);
  });

  test('can remove a username & password type credential', async function (assert) {
    assert.expect(3);
    instances.target.update({
      injectedApplicationCredentialSourceIds: [...randomlySelectedCredentials],
    });
    const credentialCount = getCredentialCount();
    await visit(urls.injectedApplicationCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialCount);
    await click('tbody tr .rose-dropdown-button-danger');
    assert.strictEqual(findAll('tbody tr').length, credentialCount - 1);
    await visit(urls.addInjectedApplicationCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialCount + 1);
  });

  test('cannot remove credential libraries without proper authorization', async function (assert) {
    assert.expect(1);
    instances.target.authorized_actions =
      instances.target.authorized_actions.filter(
        (item) => item !== 'remove-credential-sources'
      );
    await visit(urls.injectedApplicationCredentialSources);
    assert.dom('tbody tr .rose-dropdown-button-danger').doesNotExist();
  });

  test('removing a target credential library which errors displays error messages', async function (assert) {
    assert.expect(2);
    instances.target.update({
      injectedApplicationCredentialSourceIds: [...randomlySelectedCredentialLibraries],
    });
    this.server.post('/targets/:idMethod', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {},
        }
      );
    });
    const count = getCredentialLibraryCount();
    await visit(urls.injectedApplicationCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, count);
    await click('tbody tr .rose-dropdown-button-danger');
    assert.dom('[role="alert"]').isVisible();
  });

  test('removing a target credential which errors displays error messages', async function (assert) {
    assert.expect(2);
    instances.target.update({
      injectedApplicationCredentialSourceIds: [...randomlySelectedCredentials],
    });
    this.server.post('/targets/:idMethod', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {},
        }
      );
    });
    const count = getCredentialCount();
    await visit(urls.injectedApplicationCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, count);
    await click('tbody tr .rose-dropdown-button-danger');
    assert.dom('[role="alert"]').isVisible();
  });
});
