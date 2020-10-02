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

module('Acceptance | host catalogs | hosts', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    hostCatalog: null,
    hosts: null,
  };
  const urls = {
    orgScope: null,
    projects: null,
    project: null,
    hostCatalogs: null,
    hostCatalog: null,
    hosts: null,
    newHost: null
  };
  let hostsCount;

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
    instances.hosts = this.server.createList('host', 3, {
      scope: instances.scopes.project,
      hostCatalog: instances.hostCatalog
    });
    hostsCount = instances.hosts.length;
    // Generate route URLs for resources
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.projects = `${urls.orgScope}/projects`;
    urls.project = `${urls.projects}/${instances.hostCatalog.scope.id}`;
    urls.hostCatalogs = `${urls.project}/host-catalogs`;
    urls.hostCatalog = `${urls.hostCatalogs}/${instances.hostCatalog.id}`;
    urls.hosts = `${urls.hostCatalog}/hosts`;
    urls.newHost = `${urls.hosts}/new`;
  });

  test('visiting hosts', async function (assert) {
    assert.expect(3);
    await visit(urls.hosts);
    await a11yAudit();
    assert.equal(currentURL(), urls.hosts);
    assert.ok(hostsCount);
    assert.equal(findAll('tbody tr').length, hostsCount);
  });

  test('can navigate to a host form', async function (assert) {
    assert.expect(1);
    await visit(urls.hosts);
    await click('main tbody .rose-table-header-cell:nth-child(1) a');
    await a11yAudit();
    assert.notEqual(currentURL(), urls.hosts);
  });

  test('can create host and save changes', async function (assert) {
    assert.expect(1);
    await visit(urls.newHost);
    await fillIn('[name="name"]', 'Test Name');
    await fillIn('[name="description"]', 'description');
    await click('form [type="submit"]:not(:disabled)');
    await visit(urls.hosts);
    assert.equal(findAll('tbody tr').length, hostsCount + 1);
  });

  test('can create host and cancel changes', async function (assert) {
    assert.expect(2);
    await visit(urls.newHost);
    await fillIn('[name="name"]', 'Test Name');
    await click('form button:not([type="submit"])');
    assert.equal(currentURL(), urls.hosts);
    assert.equal(findAll('tbody tr').length, hostsCount);
  });

  test('saving a new host with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.post('/hosts', () => {
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
    await visit(urls.newHost);
    await fillIn('[name="name"]', 'new target');
    await click('form [type="submit"]');
    await a11yAudit();
    assert.ok(find('[role="alert"]'));
    assert.ok(find('.rose-form-error-message'));
  });
});
