import { module, test } from 'qunit';
import { visit, currentURL, fillIn, click, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | host catalogs', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null
    },
    hostCatalog: null
  };
  const urls = {
    orgScope: null,
    projects: null,
    project: null,
    hostCatalogs: null,
    newHostCatalog: null,
    hostCatalog: null
  };

  hooks.beforeEach(function () {
    // Setup Mirage mock resources for this test
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', { type: 'org',
      scope: { id: instances.scopes.global.id, type: instances.scopes.global.type }
    });
    instances.scopes.project = this.server.create('scope', { type: 'project',
      scope: { id: instances.scopes.org.id, type: instances.scopes.org.type }
    });
    instances.hostCatalog = this.server.create('host-catalog', {
      scope: {
        id: instances.scopes.project.id,
        type: instances.scopes.project.type
      }
    });

    // Generate route URLs for resources
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.projects = `${urls.orgScope}/projects`;
    urls.project = `${urls.projects}/${instances.hostCatalog.scope.id}`;
    urls.hostCatalogs = `${urls.project}/host-catalogs`;
    urls.newHostCatalog = `${urls.hostCatalogs}/new`;
    urls.hostCatalog = `${urls.hostCatalogs}/${instances.hostCatalog.id}`;
  });

  test('visiting host catalogs', async function (assert) {
    assert.expect(1);
    authenticateSession();
    await visit(urls.hostCatalogs);
    await a11yAudit();
    assert.equal(currentURL(), urls.hostCatalogs);
  });

  test('can navigate to host catalog form', async function (assert) {
    assert.expect(1);
    authenticateSession({});
    await visit(urls.hostCatalogs);
    await click('main tbody .rose-table-cell:nth-child(2) a');
    await a11yAudit();
    assert.equal(currentURL(), urls.hostCatalog);
  });

  test('can delete host catalog', async function (assert) {
    assert.expect(2);
    const hostCatalogsCount = this.server.db.hostCatalogs.length;
    authenticateSession({});
    await visit(urls.hostCatalog);
    assert.equal(currentURL(), urls.hostCatalog);
    await click('.rose-button-warning');
    assert.equal(this.server.db.hostCatalogs.length, hostCatalogsCount - 1);
  });

  test('can update host catalog and save changes', async function (assert) {
    assert.expect(1);
    authenticateSession({});
    await visit(urls.hostCatalog);
    await fillIn('[name="name"]', 'Test Name');
    await click('form [type="submit"]:not(:disabled)');
    assert.equal(this.server.db.hostCatalogs[0].name, 'Test Name');
  });

  test('can update host catalog and cancel changes', async function (assert) {
    assert.expect(1);
    authenticateSession({});
    await visit(urls.hostCatalog);
    await fillIn('[name="name"]', 'Test Name');
    await click('form button:not([type="submit"])');
    assert.notEqual(this.server.db.hostCatalogs[0].name, 'Test Name');
  });

  test('can create host catalog and save changes', async function(assert) {
    assert.expect(1);
    const hostCatalogsCount = this.server.db.hostCatalogs.length;
    authenticateSession({});
    await visit(urls.newHostCatalog);
    await fillIn('[name="name"]', 'Test Name');
    await click('form [type="submit"]:not(:disabled)');
    assert.equal(this.server.db.hostCatalogs.length, hostCatalogsCount + 1);
  });

  test('can create host catalog and cancel changes', async function(assert) {
    assert.expect(1);
    const hostCatalogsCount = this.server.db.hostCatalogs.length;
    authenticateSession({});
    await visit(urls.newHostCatalog);
    await fillIn('[name="name"]', 'Test Name');
    await click('form button:not([type="submit"])');
    assert.equal(this.server.db.hostCatalogs.length, hostCatalogsCount);
  });

  test('errors are displayed when save host catalog fails', async function (assert) {
    assert.expect(1);
    this.server.patch('/scopes/:scope_id/host-catalogs/:id', () => {
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
    authenticateSession({});
    await visit(urls.hostCatalog);
    await fillIn('[name="name"]', 'random string');
    await click('form [type="submit"]');
    await a11yAudit();
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'Oops.',
      'Displays primary error message.'
    );
  });

  test('errors are displayed when delete host catalog fails', async function (assert) {
    assert.expect(1);
    this.server.del('/scopes/:scope_id/host-catalogs/:id', () => {
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
    authenticateSession({});
    await visit(urls.hostCatalog);
    await click('.rose-button-warning');
    await a11yAudit();
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'Oops.',
      'Displays primary error message.'
    );
  });

  test('saving a new host catalog with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.post('/scopes/:scope_id/host-catalogs', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {
            fields: [
              {
                name: 'name',
                message: 'Name is required.',
              },
            ],
          },
        }
      );
    });
    authenticateSession({});
    await visit(urls.newHostCatalog);
    await fillIn('[name="name"]', 'random string');
    await click('form [type="submit"]');
    await a11yAudit();
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'The request was invalid.',
      'Displays primary error message.'
    );
    assert.ok(
      find('.rose-form-error-message').textContent.trim(),
      'Name is required.',
      'Displays field-level errors.'
    );
  });

  test('saving an existing host catalog with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.patch('/scopes/:scope_id/host-catalogs/:id', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {
            fields: [
              {
                name: 'name',
                message: 'Name is required.',
              },
            ],
          },
        }
      );
    });
    authenticateSession({});
    await visit(urls.hostCatalog);
    await fillIn('[name="name"]', 'random string');
    await click('form [type="submit"]');
    await a11yAudit();
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'The request was invalid.',
      'Displays primary error message.'
    );
    assert.ok(
      find('.rose-form-error-message').textContent.trim(),
      'Name is required.',
      'Displays field-level errors.'
    );
  });
});
