import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
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
      hostCatalog: null
    },
    host: null
  };
  const urls = {
    orgScope: null,
    projects: null,
    project: null,
    hostCatalogs: null,
    hostCatalog: null,
    hosts: null
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
    instances.scopes.hostCatalog = this.server.create('host', {
      scope: {
        id: instances.scopes.project.id,
        type: instances.scopes.project.type
      }
    });

    instances.host = this.server.create('host', {
      scope: {
        id: instances.scopes.project.id,
        type: instances.scopes.project.type
      },
      hostCatalog: {
        id: instances.scopes.hostCatalog.id,
        type: instances.scopes.hostCatalog.type
      }
    });

    // Generate route URLs for resources
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.projects = `${urls.orgScope}/projects`;
    urls.project = `${urls.projects}/${instances.scopes.hostCatalog.scope.id}`;
    urls.hostCatalogs = `${urls.project}/host-catalogs`;
    urls.hostCatalog = `${urls.hostCatalogs}/${instances.scopes.hostCatalog.id}`;
    urls.hosts = `${urls.hostCatalog}/host`;
  });

  test('visiting host', async function (assert) {
    assert.expect(1);
    authenticateSession();
    await visit(urls.hosts);
    await a11yAudit();
    assert.equal(currentURL(), urls.hosts);
  });

  test('can navigate to a host form', async function (assert) {
    assert.expect(0);
  });

  test('can update a host and save changes', async function (assert) {
    assert.expect(0);
  });

  test('can update a host and cancel changes', async function (assert) {
    assert.expect(0);
  });

  test('can create new host', async function (assert) {
    assert.expect(0);
  });

  test('can cancel new host creation', async function (assert) {
    assert.expect(0);
  });

  test('saving a new host with invalid fields displays error messages', async function (assert) {
    assert.expect(0);
  });

  test('errors are displayed when save on auth method fails', async function (assert) {
    assert.expect(0);
  });

  test('errors are displayed when delete on a host fails', async function (assert) {
    assert.expect(0);
  });

  test('saving an existing host with invalid fields displays error messages', async function (assert) {
    assert.expect(0);
  });
});
