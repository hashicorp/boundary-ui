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

module('Acceptance | host-catalogs | read', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
  };
  const urls = {
    globalScope: null,
    orgScope: null,
    projectScope: null,
    hostCatalogs: null,
    hostCatalog: null,
    newHostCatalog: null,
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
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.hostCatalogs = `${urls.projectScope}/host-catalogs`;
    urls.hostCatalog = `${urls.hostCatalogs}/${instances.hostCatalog.id}`;
    urls.unknownHostCatalog = `${urls.hostCatalogs}/foo`;
    urls.newHostCatalog = `${urls.hostCatalogs}/new`;
    authenticateSession({});
  });

  test('visiting host catalogs', async function (assert) {
    assert.expect(2);
    await visit(urls.hostCatalogs);
    await a11yAudit();
    assert.equal(currentURL(), urls.hostCatalogs);
    await visit(urls.hostCatalog);
    await a11yAudit();
    assert.equal(currentURL(), urls.hostCatalog);
  });

  test('cannot navigate to a host catalog form without proper authorization', async function (assert) {
    assert.expect(1);
    instances.hostCatalog.authorized_actions =
      instances.hostCatalog.authorized_actions.filter(
        (item) => item !== 'read'
      );
    await visit(urls.hostCatalog);
    assert.notOk(find('main tbody .rose-table-header-cell:nth-child(1) a'));
  });

  test('visiting an unknown host catalog displays 404 message', async function (assert) {
    assert.expect(1);
    await visit(urls.unknownHostCatalog);
    await a11yAudit();
    assert.ok(find('.rose-message-subtitle').textContent.trim(), 'Error 404');
  });
});
