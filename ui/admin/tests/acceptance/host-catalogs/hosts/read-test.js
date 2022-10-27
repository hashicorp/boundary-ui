import { module, test } from 'qunit';
import { visit, currentURL, find, click } from '@ember/test-helpers';
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
    },
    hostCatalog: null,
    host: null,
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
  };

  hooks.beforeEach(async function () {
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

    authenticateSession({});
    await visit(urls.hostCatalog);
  });

  test('visiting hosts', async function (assert) {
    assert.expect(2);
    await click(`[href="${urls.hosts}"]`);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.hosts);

    await click(`[href="${urls.host}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.host);
  });

  test('cannot navigate to a host form without proper authorization', async function (assert) {
    assert.expect(1);
    instances.host.authorized_actions =
      instances.host.authorized_actions.filter((item) => item !== 'read');

    await click(`[href="${urls.hosts}"]`);

    assert.dom(`[href="${urls.host}"]`).doesNotExist();
  });

  test('visiting an unknown host displays 404 message', async function (assert) {
    assert.expect(2);
    await click(`[href="${urls.hosts}"]`);
    assert.dom(`[href="${urls.unknownHost}"]`).doesNotExist();

    await visit(urls.unknownHost);
    await a11yAudit();

    assert.strictEqual(
      find('.rose-message-subtitle').textContent.trim(),
      'Error 404'
    );
  });

  test('users can link to docs page for hosts', async function (assert) {
    assert.expect(1);

    await click(`[href="${urls.hosts}"]`);
    await click(`[href="${urls.host}"]`);

    assert
      .dom(`[href="https://boundaryproject.io/help/admin-ui/hosts"]`)
      .isVisible();
  });
});
