import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | host-catalogs | host sets | read', function (hooks) {
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
    globalScope: null,
    orgScope: null,
    projectScope: null,
    hostCatalogs: null,
    hostCatalog: null,
    hostSets: null,
    hostSet: null,
    unknownHostSet: null,
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
    instances.hostSet = this.server.create('host-set', {
      scope: instances.scopes.project,
      hostCatalog: instances.hostCatalog,
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.hostCatalogs = `${urls.projectScope}/host-catalogs`;
    urls.hostCatalog = `${urls.hostCatalogs}/${instances.hostCatalog.id}`;
    urls.hostSets = `${urls.hostCatalog}/host-sets`;
    urls.hostSet = `${urls.hostSets}/${instances.hostSet.id}`;
    urls.unknownHostSet = `${urls.hostSets}/foo`;

    authenticateSession({});
  });

  test('visiting host sets', async function (assert) {
    assert.expect(2);
    await visit(urls.hostSets);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.hostSets);

    await click(`[href="${urls.hostSet}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.hostSet);
  });

  test('cannot navigate to a host set form without proper authorization', async function (assert) {
    assert.expect(1);
    await visit(urls.hostCatalog);
    instances.hostSet.authorized_actions =
      instances.hostSet.authorized_actions.filter((item) => item !== 'read');

    await click(`[href="${urls.hostSets}"]`);

    assert.dom('.rose-table-body  tr:first-child a').doesNotExist();
  });

  test('visiting an unknown host set displays 404 message', async function (assert) {
    assert.expect(1);

    await visit(urls.unknownHostSet);
    await a11yAudit();

    assert.dom('.rose-message-subtitle').hasText('Error 404');
  });

  test('users can link to docs page for host sets', async function (assert) {
    assert.expect(1);
    await visit(urls.hostSets);

    await click(`[href="${urls.hostSet}"]`);

    assert
      .dom(`[href="https://boundaryproject.io/help/admin-ui/host-sets"]`)
      .exists();
  });
});
