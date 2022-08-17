import { module, test } from 'qunit';
import { visit, find, findAll, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | targets | credential sources', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let getCredentialLibraryCount;
  let getCredentialCount;
  let credentialSourceCount;

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
    addCredentialSources: null,
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
      credentialLibraries: instances.credentialLibraries,
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.targets = `${urls.projectScope}/targets`;
    urls.target = `${urls.targets}/${instances.target.id}`;
    urls.credentialSources = `${urls.target}/brokered-credential-sources`;
    urls.credentialLibrary = `${urls.projectScope}/credential-stores/${instances.credentialLibrary.credentialStoreId}/credential-libraries/${instances.credentialLibrary.id}`;
    urls.credential = `${urls.projectScope}/credential-stores/${instances.credential.credentialStoreId}/credentials/${instances.credential.id}`;
    urls.addCredentialSources = `${urls.target}/add-brokered-credential-sources`;
    // Generate resource counter
    getCredentialLibraryCount = () =>
      this.server.schema.credentialLibraries.all().models.length;
    getCredentialCount = () =>
      this.server.schema.credentials.all().models.length;
    credentialSourceCount = getCredentialLibraryCount() + getCredentialCount();
    authenticateSession({});
  });

  test('visiting target credential sources', async function (assert) {
    assert.expect(2);
    await visit(urls.credentialSources);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.credentialSources);
    assert.strictEqual(findAll('tbody tr').length, getCredentialLibraryCount());
  });

  test('can navigate to a vault type credential library', async function (assert) {
    assert.expect(1);
    await visit(urls.credentialSources);
    await click('main tbody .rose-table-header-cell:nth-child(1) a');
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.credentialLibrary);
  });

  test('can navigate to a username & password type credential', async function (assert) {
    assert.expect(1);
    instances.target.update({
      credentialLibraries: [],
      credentials: instances.credentials,
    });
    await visit(urls.credentialSources);
    await click('main tbody .rose-table-header-cell:nth-child(1) a');
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.credential);
  });

  test('visiting add credential sources', async function (assert) {
    assert.expect(1);
    await visit(urls.addCredentialSources);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.addCredentialSources);
  });

  test('displays list of all credential source types available', async function (assert) {
    assert.expect(2);
    instances.target.update({ credentialLibraries: [] });
    await visit(urls.addCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialSourceCount);
    assert.notOk(find('.rose-message-title'));
  });

  test('displays list of credential sources with only credential libraries available', async function (assert) {
    assert.expect(2);
    instances.target.update({ credentialLibraries: [] });
    this.server.db.credentials.remove();
    await visit(urls.addCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, getCredentialLibraryCount());
    assert.notOk(find('.rose-message-title'));
  });

  test('displays list of credential sources with only credentials available', async function (assert) {
    assert.expect(2);
    await visit(urls.addCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, getCredentialCount());
    assert.notOk(find('.rose-message-title'));
  });

  test('displays no credential sources message when none available', async function (assert) {
    assert.expect(1);
    instances.target.update({ credentialLibraries: [] });
    this.server.db.credentialLibraries.remove();
    this.server.db.credentials.remove();
    await visit(urls.addCredentialSources);
    assert.strictEqual(
      find('.rose-message-title').textContent.trim(),
      'No Brokered Credential Sources Available'
    );
  });

  test('when no credential sources available, button routes to credential sources', async function (assert) {
    assert.expect(1);
    instances.target.update({ credentialLibraries: [] });
    this.server.db.credentialLibraries.remove();
    this.server.db.credentials.remove();
    await visit(urls.addCredentialSources);
    await click(find('.rose-message-link'));
    assert.strictEqual(currentURL(), urls.credentialSources);
  });

  test('can select and save a vault type credential library to add', async function (assert) {
    assert.expect(4);
    instances.target.update({ credentialLibraries: [] });
    await visit(urls.credentialSources);
    assert.strictEqual(findAll('tbody tr').length, 0);
    await visit(urls.addCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialSourceCount);
    await click('tbody tr:first-child label');
    await click('form [type="submit"]');
    assert.strictEqual(currentURL(), urls.credentialSources);
    assert.strictEqual(findAll('tbody tr').length, 1);
  });

  test('can select and save a username & password type credential to add', async function (assert) {
    assert.expect(4);
    instances.target.update({ credentialLibraries: [] });
    await visit(urls.credentialSources);
    assert.strictEqual(findAll('tbody tr').length, 0);
    await visit(urls.addCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialSourceCount);
    await click('tbody tr:last-child label');
    await click('form [type="submit"]');
    assert.strictEqual(currentURL(), urls.credentialSources);
    assert.strictEqual(findAll('tbody tr').length, 1);
  });

  test('can select and save both a credential-library and a credential to add', async function (assert) {
    assert.expect(4);
    instances.target.update({ credentialLibraries: [] });
    await visit(urls.credentialSources);
    assert.strictEqual(findAll('tbody tr').length, 0);
    await visit(urls.addCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialSourceCount);
    await click('tbody tr:last-child label');
    await click('tbody tr:first-child label');
    await click('form [type="submit"]');
    assert.strictEqual(currentURL(), urls.credentialSources);
    assert.strictEqual(findAll('tbody tr').length, 2);
  });

  test('cannot add credential sources without proper authorization', async function (assert) {
    assert.expect(1);
    instances.target.authorized_actions =
      instances.target.authorized_actions.filter(
        (item) => item !== 'add-credential-sources'
      );
    await visit(urls.credentialSources);
    assert.notOk(find(`[href="${urls.addCredentialSources}"]`));
  });

  test('can select and cancel credential sources to add', async function (assert) {
    assert.expect(4);
    instances.target.update({ credentialLibraries: [] });
    await visit(urls.credentialSources);
    assert.strictEqual(findAll('tbody tr').length, 0);
    await visit(urls.addCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialSourceCount);
    await click('tbody label');
    await click('form [type="button"]');
    assert.strictEqual(currentURL(), urls.credentialSources);
    assert.strictEqual(findAll('tbody tr').length, 0);
  });

  test('can select multiple credential sources to add and cancel', async function (assert) {
    assert.expect(4);
    instances.target.update({ credentialLibraries: [] });
    await visit(urls.credentialSources);
    assert.strictEqual(findAll('tbody tr').length, 0);
    await visit(urls.addCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialSourceCount);
    await click('tbody tr:last-child label');
    await click('tbody tr:first-child label');
    await click('form [type="button"]');
    assert.strictEqual(currentURL(), urls.credentialSources);
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
    instances.target.update({ credentialLibraries: [] });
    await visit(urls.addCredentialSources);
    await click('tbody tr:last-child label');
    await click('tbody tr:first-child label');
    await click('form [type="submit"]');
    assert.ok(find('[role="alert"]'));
  });

  test('can remove a vault type credential library', async function (assert) {
    assert.expect(3);
    const credentialLibraryCount = getCredentialLibraryCount();
    const credentialCount = getCredentialCount();
    await visit(urls.credentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialLibraryCount);
    await click('tbody tr .rose-dropdown-button-danger');
    assert.strictEqual(findAll('tbody tr').length, credentialLibraryCount - 1);
    await visit(urls.addCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialCount + 1);
  });

  test('can remove a username & password type credential', async function (assert) {
    assert.expect(3);
    instances.target.update({
      credentialLibraries: [],
      credentials: instances.credentials,
    });
    const credentialCount = getCredentialCount();
    const credentialLibraryCount = getCredentialLibraryCount();
    await visit(urls.credentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialCount);
    await click('tbody tr .rose-dropdown-button-danger');
    assert.strictEqual(findAll('tbody tr').length, credentialCount - 1);
    await visit(urls.addCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialLibraryCount + 1);
  });

  test('cannot remove credential libraries without proper authorization', async function (assert) {
    assert.expect(1);
    instances.target.authorized_actions =
      instances.target.authorized_actions.filter(
        (item) => item !== 'remove-credential-sources'
      );
    await visit(urls.credentialSources);
    assert.notOk(find('tbody tr .rose-dropdown-button-danger'));
  });

  test('removing a target credential library which errors displays error messages', async function (assert) {
    assert.expect(2);
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
    await visit(urls.credentialSources);
    assert.strictEqual(findAll('tbody tr').length, count);
    await click('tbody tr .rose-dropdown-button-danger');
    assert.ok(find('[role="alert"]'));
  });

  test('removing a target credential which errors displays error messages', async function (assert) {
    assert.expect(2);
    instances.target.update({
      credentialLibraries: [],
      credentials: instances.credentials,
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
    await visit(urls.credentialSources);
    assert.strictEqual(findAll('tbody tr').length, count);
    await click('tbody tr .rose-dropdown-button-danger');
    assert.ok(find('[role="alert"]'));
  });
});
