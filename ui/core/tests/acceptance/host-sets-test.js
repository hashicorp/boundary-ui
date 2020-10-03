import { module, test } from 'qunit';
import { visit, currentURL, fillIn, click, find, findAll } from '@ember/test-helpers';
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

module('Acceptance | host sets', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    hostCatalog: null,
    hostSet: null,
  };
  const urls = {
    orgScope: null,
    projects: null,
    project: null,
    hostCatalogs: null,
    hostCatalog: null,
    hostSets: null,
    hostSet: null,
    newHostSet: null
  };

  hooks.beforeEach(function () {
    // Setup Mirage mock resources for this test
    authenticateSession();
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    instances.hostCatalog = this.server.create('host-catalog', {
      scope: instances.scopes.project,
    });
    instances.hostSet = this.server.create('host-set', {
      scope: instances.scopes.project,
      hostCatalog: instances.hostCatalog
    });
    // Generate route URLs for resources
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.projects = `${urls.orgScope}/projects`;
    urls.project = `${urls.projects}/${instances.hostCatalog.scope.id}`;
    urls.hostCatalogs = `${urls.project}/host-catalogs`;
    urls.hostCatalog = `${urls.hostCatalogs}/${instances.hostCatalog.id}`;
    urls.hostSets = `${urls.hostCatalog}/host-sets`;
    urls.hostSet = `${urls.hostSets}/${instances.hostSet.id}`;
    urls.newHostSet = `${urls.hostSets}/new`;
  });

  test('visiting a host set', async function (assert) {
    assert.expect(1);
    await visit(urls.hostSet);
    await a11yAudit();
    assert.equal(currentURL(), urls.hostSet);
  });

  test('can update a host set and save changes', async function (assert) {
    assert.expect(3);
    await visit(urls.hostSet);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'Updated name');
    await fillIn('[name="description"]', 'Updated description');
    await click('.rose-form-actions [type="submit"]');
    assert.equal(currentURL(), urls.hostSet);
    assert.equal(this.server.db.hostSets[0].name, 'Updated name');
    assert.equal(this.server.db.hostSets[0].description, 'Updated description');
  });

  test('can update a host set and cancel changes', async function (assert) {
    assert.expect(1);
    await visit(urls.hostSet);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'Updated name');
    await click('.rose-form-actions [type="button"]');
    assert.notEqual(find('[name="name"]').value, 'Updated name');
  });

  test('can delete host set', async function (assert) {
    assert.expect(2);
    const hostSetsCount = this.server.db.hostSets.length;
    await visit(urls.hostSet);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.equal(currentURL(), urls.hostSets);
    assert.equal(this.server.db.hostSets.length, hostSetsCount - 1);
  });

  test('saving an existing host set with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.patch('/host-sets/:id', () => {
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
    await visit(urls.hostSet);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'existing host');
    await click('[type="submit"]');
    await a11yAudit();
    assert.ok(find('[role="alert"]'));
    assert.ok(find('.rose-form-error-message'));
  });

  test('errors are displayed when delete on a host set fails', async function (assert) {
    assert.expect(1);
    this.server.del('/host-sets/:id', () => {
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
    await visit(urls.hostSet);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    await a11yAudit();
    assert.ok(find('[role="alert"]'));
  });

  test('can create host set and save changes', async function (assert) {
    assert.expect(1);
    const hostSetsCount = this.server.db.hostSets.length;
    await visit(urls.newHostSet);
    await fillIn('[name="name"]', 'Test Name');
    await fillIn('[name="description"]', 'description');
    await click('form [type="submit"]:not(:disabled)');
    await visit(urls.hostSets);
    assert.equal(findAll('tbody tr').length, hostSetsCount + 1);
  });

  test('can create host set and cancel changes', async function (assert) {
    assert.expect(2);
    const hostSetsCount = this.server.db.hostSets.length;
    await visit(urls.newHostSet);
    await fillIn('[name="name"]', 'Test Name');
    await click('form button:not([type="submit"])');
    assert.equal(currentURL(), urls.hostSets);
    assert.equal(findAll('tbody tr').length, hostSetsCount);
  });

  test('saving a new host set with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.post('/host-sets', () => {
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
    await visit(urls.newHostSet);
    await fillIn('[name="name"]', 'new target');
    await click('form [type="submit"]');
    await a11yAudit();
    assert.ok(find('[role="alert"]'));
    assert.ok(find('.rose-form-error-message'));
  });
});
