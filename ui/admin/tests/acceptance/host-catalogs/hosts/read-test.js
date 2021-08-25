import { module, test } from 'qunit';
import { visit, currentURL, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | host-catalogs | hosts | read', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
      hostCatalog: null,
      host: null,
    },
  };
  const urls = {
    globalScope: null,
    orgScope: null,
    projectScope: null,
    hostCatalogs: null,
    hostCatalog: null,
    hosts: null,
    host: null,
    unknownHost: null,
    newHost: null,
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
    instances.hostCatalog = this.server.create('host-catalog', {
      scope: instances.scopes.project,
    });
    instances.host = this.server.create('host', {
      scope: instances.scopes.project,
      hostCatalog: instances.hostCatalog,
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.hostCatalogs = `${urls.projectScope}/host-catalogs`;
    urls.hostCatalog = `${urls.hostCatalogs}/${instances.hostCatalog.id}`;
    urls.hosts = `${urls.hostCatalog}/hosts`;
    urls.host = `${urls.hosts}/${instances.host.id}`;
    urls.unknownHost = `${urls.hosts}/foo`;
    urls.newHost = `${urls.hosts}/new`;
    // Generate resource couner
    authenticateSession({});
  });

  test('visiting hosts', async function (assert) {
    assert.expect(2);
    await visit(urls.hosts);
    await a11yAudit();
    assert.equal(currentURL(), urls.hosts);
    await visit(urls.host);
    await a11yAudit();
    assert.equal(currentURL(), urls.host);
  });

  test('cannot navigate to a role form without proper authorization', async function (assert) {
    assert.expect(1);
    instances.host.authorized_actions =
      instances.host.authorized_actions.filter((item) => item !== 'read');
    await visit(urls.hosts);
    assert.notOk(find('main tbody .rose-table-header-cell:nth-child(1) a'));
  });

  test('visiting an unknown host displays 404 message', async function (assert) {
    assert.expect(1);
    await visit(urls.unknownHost);
    await a11yAudit();
    assert.ok(find('.rose-message-subtitle').textContent.trim(), 'Error 404');
  });
});
