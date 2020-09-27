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

module('Acceptance | hosts', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    hostCatalog: null,
    host: null,
  };
  const urls = {
    orgScope: null,
    projects: null,
    project: null,
    hostCatalogs: null,
    hostCatalog: null,
    hosts: null,
    host: null,
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
    instances.host = this.server.create('host', {
      scope: instances.scopes.project,
      hostCatalog: instances.hostCatalog
    });
    // Generate route URLs for resources
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.projects = `${urls.orgScope}/projects`;
    urls.project = `${urls.projects}/${instances.hostCatalog.scope.id}`;
    urls.hostCatalogs = `${urls.project}/host-catalogs`;
    urls.hostCatalog = `${urls.hostCatalogs}/${instances.hostCatalog.id}`;
    urls.hosts = `${urls.hostCatalog}/hosts`;
    urls.host = `${urls.hosts}/${instances.host.id}`;
  });

  test('visiting a host', async function (assert) {
    assert.expect(1);
    await visit(urls.host);
    await a11yAudit();
    assert.equal(currentURL(), urls.host);
  });

  test('can update a host and save changes', async function (assert) {
    assert.expect(4);
    await visit(urls.host);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'Updated name');
    await fillIn('[name="description"]', 'Updated description');
    await fillIn('[name="address"]', '::1');
    await click('.rose-form-actions [type="submit"]');
    assert.equal(currentURL(), urls.host);
    assert.equal(this.server.db.hosts[0].name, 'Updated name');
    assert.equal(this.server.db.hosts[0].description, 'Updated description');
    assert.equal(this.server.db.hosts[0].attributes.address, '::1');
  });

  test('can update a host and cancel changes', async function (assert) {
    assert.expect(1);
    await visit(urls.host);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'Updated name');
    await click('.rose-form-actions [type="button"]');
    assert.notEqual(find('[name="name"]').value, 'Updated name');
  });

  test('can delete host', async function (assert) {
    assert.expect(2);
    const hostsCount = this.server.db.hosts.length;
    await visit(urls.host);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.equal(currentURL(), urls.hosts);
    assert.equal(this.server.db.hosts.length, hostsCount - 1);
  });

  test('saving an existing host with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.patch('/hosts/:id', () => {
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
    await visit(urls.host);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'existing host');
    await click('[type="submit"]');
    await a11yAudit();
    assert.ok(find('[role="alert"]'));
    assert.ok(find('.rose-form-error-message'));
  });

  test('errors are displayed when delete on a host fails', async function (assert) {
    assert.expect(1);
    this.server.del('/hosts/:id', () => {
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
    await visit(urls.host);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    await a11yAudit();
    assert.ok(find('[role="alert"]'));
  });
});
