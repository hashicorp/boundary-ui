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

module('Acceptance | host catalogs | host sets', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    hostCatalog: null,
    hostSets: null,
  };
  const urls = {
    orgScope: null,
    projects: null,
    project: null,
    hostCatalogs: null,
    hostCatalog: null,
    hostSets: null,
    newHostSet: null
  };
  let hostSetsCount;

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
    instances.hostSets = this.server.createList('host-set', 3, {
      scope: instances.scopes.project,
      hostCatalog: instances.hostCatalog
    });
    hostSetsCount = instances.hostCatalog.hostSetIds.length;
    // Generate route URLs for resources
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.projects = `${urls.orgScope}/projects`;
    urls.project = `${urls.projects}/${instances.hostCatalog.scope.id}`;
    urls.hostCatalogs = `${urls.project}/host-catalogs`;
    urls.hostCatalog = `${urls.hostCatalogs}/${instances.hostCatalog.id}`;
    urls.hostSets = `${urls.hostCatalog}/host-sets`;
    urls.newHostSet = `${urls.hostSets}/new`;
  });

  test('visiting host sets', async function (assert) {
    assert.expect(3);
    await visit(urls.hostSets);
    await a11yAudit();
    assert.equal(currentURL(), urls.hostSets);
    assert.ok(hostSetsCount);
    assert.equal(findAll('tbody tr').length, hostSetsCount);
  });

  test('can navigate to a host set form', async function (assert) {
    assert.expect(1);
    await visit(urls.hostSets);
    await click('main tbody .rose-table-header-cell:nth-child(1) a');
    await a11yAudit();
    assert.notEqual(currentURL(), urls.hostSets);
  });

  test('can create host set and save changes', async function (assert) {
    assert.expect(1);
    await visit(urls.newHostSet);
    await fillIn('[name="name"]', 'Test Name');
    await fillIn('[name="description"]', 'description');
    await click('form [type="submit"]:not(:disabled)');
    await visit(urls.hostSets);
    assert.equal(findAll('tbody tr').length, hostSetsCount + 1);
  });

  test('can create host set and cancel changes', async function (assert) {
    assert.expect(2);
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
