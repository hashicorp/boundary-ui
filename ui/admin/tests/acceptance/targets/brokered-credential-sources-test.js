import { module, test } from 'qunit';
import { visit, find, findAll, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | targets | brokered credential sources', function (hooks) {
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
    addBrokeredCredentialSources: null,
    brokeredCredentialSources: null,
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
      attributes: {
        brokeredCredentialSourceIds: [
          ...randomlySelectedCredentialLibraries,
          ...randomlySelectedCredentials,
        ],
      },
    });

    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.targets = `${urls.projectScope}/targets`;
    urls.target = `${urls.targets}/${instances.target.id}`;
    urls.brokeredCredentialSources = `${urls.target}/brokered-credential-sources`;
    urls.credentialLibrary = `${urls.projectScope}/credential-stores/${instances.credentialLibrary.credentialStoreId}/credential-libraries/${instances.credentialLibrary.id}`;
    urls.credential = `${urls.projectScope}/credential-stores/${instances.credential.credentialStoreId}/credentials/${instances.credential.id}`;
    urls.addBrokeredCredentialSources = `${urls.target}/add-brokered-credential-sources`;
    getCredentialLibraryCount = () =>
      this.server.schema.credentialLibraries.all().models.length;
    getCredentialCount = () =>
      this.server.schema.credentials.all().models.length;
    credentialSourceCount = getCredentialLibraryCount() + getCredentialCount();

    authenticateSession({});
  });

  test('visiting target brokered credential sources', async function (assert) {
    assert.expect(2);
    await visit(urls.brokeredCredentialSources);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.brokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialSourceCount);
  });

  test('can navigate to a vault type credential library', async function (assert) {
    assert.expect(1);
    await visit(urls.brokeredCredentialSources);
    await click('main tbody .rose-table-header-cell:nth-child(1) a');
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.credentialLibrary);
  });

  test('can navigate to a username & password type credential', async function (assert) {
    assert.expect(1);
    instances.target.update({
      attributes: {
        brokeredCredentialSourceIds: [...randomlySelectedCredentials],
      },
    });
    await visit(urls.brokeredCredentialSources);
    await click('main tbody .rose-table-header-cell:nth-child(1) a');
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.credential);
  });

  test('visiting add brokered credential sources', async function (assert) {
    assert.expect(1);
    await visit(urls.addBrokeredCredentialSources);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.addBrokeredCredentialSources);
  });

  test('displays list of all brokered credential source types available', async function (assert) {
    assert.expect(2);
    instances.target.update({
      attributes: {
        brokeredCredentialSourceIds: [],
      },
    });
    await visit(urls.addBrokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialSourceCount);
    assert.notOk(find('.rose-message-title'));
  });

  test('displays list of brokered credential sources with only credential libraries available', async function (assert) {
    assert.expect(2);
    instances.target.update({
      attributes: {
        brokeredCredentialSourceIds: [...randomlySelectedCredentialLibraries],
      },
    });
    await visit(urls.addBrokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, getCredentialLibraryCount());
    assert.notOk(find('.rose-message-title'));
  });

  test('displays no brokered credential sources message when none available', async function (assert) {
    assert.expect(1);
    await visit(urls.addBrokeredCredentialSources);
    assert.strictEqual(
      find('.rose-message-title').textContent.trim(),
      'No Brokered Credential Sources Available'
    );
  });

  test('when no brokered credential sources available, button routes to add brokered credential sources', async function (assert) {
    assert.expect(1);
    instances.target.update({
      attributes: {
        brokeredCredentialSourceIds: [],
      },
    });
    await visit(urls.brokeredCredentialSources);
    await click(find('.rose-message-link'));
    assert.strictEqual(currentURL(), urls.addBrokeredCredentialSources);
  });

  test('can select and save a vault type credential library to add', async function (assert) {
    assert.expect(4);
    instances.target.update({
      attributes: {
        brokeredCredentialSourceIds: [],
      },
    });
    await visit(urls.brokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, 0);
    await visit(urls.addBrokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialSourceCount);
    await click('tbody tr:first-child label');
    await click('form [type="submit"]');
    assert.strictEqual(currentURL(), urls.brokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, 1);
  });

  test('can select and save a username & password type credential to add', async function (assert) {
    assert.expect(4);
    instances.target.update({
      attributes: {
        brokeredCredentialSourceIds: [],
      },
    });
    await visit(urls.brokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, 0);
    await visit(urls.addBrokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialSourceCount);
    await click('tbody tr:last-child label');
    await click('form [type="submit"]');
    assert.strictEqual(currentURL(), urls.brokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, 1);
  });

  test('can select and save both a credential-library and a credential to add', async function (assert) {
    assert.expect(4);
    instances.target.update({
      attributes: {
        brokeredCredentialSourceIds: [],
      },
    });
    await visit(urls.brokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, 0);
    await visit(urls.addBrokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialSourceCount);
    await click('tbody tr:last-child label');
    await click('tbody tr:first-child label');
    await click('form [type="submit"]');
    assert.strictEqual(currentURL(), urls.brokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, 2);
  });

  test('cannot add credential sources without proper authorization', async function (assert) {
    assert.expect(1);
    instances.target.authorized_actions =
      instances.target.authorized_actions.filter(
        (item) => item !== 'add-credential-sources'
      );
    await visit(urls.brokeredCredentialSources);
    assert.notOk(find(`[href="${urls.addBrokeredCredentialSources}"]`));
  });

  test('can select and cancel credential sources to add', async function (assert) {
    assert.expect(4);
    instances.target.update({
      attributes: {
        brokeredCredentialSourceIds: [],
      },
    });
    await visit(urls.brokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, 0);
    await visit(urls.addBrokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialSourceCount);
    await click('tbody label');
    await click('form [type="button"]');
    assert.strictEqual(currentURL(), urls.brokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, 0);
  });

  test('can select multiple brokered credential sources to add and cancel', async function (assert) {
    assert.expect(4);
    instances.target.update({
      attributes: {
        brokeredCredentialSourceIds: [],
      },
    });
    await visit(urls.brokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, 0);
    await visit(urls.addBrokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialSourceCount);
    await click('tbody tr:last-child label');
    await click('tbody tr:first-child label');
    await click('form [type="button"]');
    assert.strictEqual(currentURL(), urls.brokeredCredentialSources);
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
      attributes: {
        brokeredCredentialSourceIds: [],
      },
    });
    await visit(urls.addBrokeredCredentialSources);
    await click('tbody tr:last-child label');
    await click('tbody tr:first-child label');
    await click('form [type="submit"]');
    assert.ok(find('[role="alert"]'));
  });

  test('can remove a vault type credential library', async function (assert) {
    assert.expect(3);
    instances.target.update({
      attributes: {
        brokeredCredentialSourceIds: [...randomlySelectedCredentialLibraries],
      },
    });
    const credentialLibraryCount = getCredentialLibraryCount();
    await visit(urls.brokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialLibraryCount);
    await click('tbody tr .rose-dropdown-button-danger');
    assert.strictEqual(findAll('tbody tr').length, credentialLibraryCount - 1);
    await visit(urls.addBrokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialLibraryCount + 1);
  });

  test('can remove a username & password type credential', async function (assert) {
    assert.expect(3);
    instances.target.update({
      attributes: {
        brokeredCredentialSourceIds: [...randomlySelectedCredentials],
      },
    });
    const credentialCount = getCredentialCount();
    await visit(urls.brokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialCount);
    await click('tbody tr .rose-dropdown-button-danger');
    assert.strictEqual(findAll('tbody tr').length, credentialCount - 1);
    await visit(urls.addBrokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, credentialCount + 1);
  });

  test('cannot remove credential libraries without proper authorization', async function (assert) {
    assert.expect(1);
    instances.target.authorized_actions =
      instances.target.authorized_actions.filter(
        (item) => item !== 'remove-credential-sources'
      );
    await visit(urls.brokeredCredentialSources);
    assert.notOk(find('tbody tr .rose-dropdown-button-danger'));
  });

  test('removing a target credential library which errors displays error messages', async function (assert) {
    assert.expect(2);
    instances.target.update({
      attributes: {
        brokeredCredentialSourceIds: [...randomlySelectedCredentialLibraries],
      },
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
    await visit(urls.brokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, count);
    await click('tbody tr .rose-dropdown-button-danger');
    assert.ok(find('[role="alert"]'));
  });

  test('removing a target credential which errors displays error messages', async function (assert) {
    assert.expect(2);
    instances.target.update({
      attributes: {
        brokeredCredentialSourceIds: [...randomlySelectedCredentials],
      },
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
    await visit(urls.brokeredCredentialSources);
    assert.strictEqual(findAll('tbody tr').length, count);
    await click('tbody tr .rose-dropdown-button-danger');
    assert.ok(find('[role="alert"]'));
  });
});
