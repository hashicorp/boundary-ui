import { module, test } from 'qunit';
import { visit, currentURL, click, find, findAll } from '@ember/test-helpers';
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

module('Acceptance | host-sets | hosts', function (hooks) {
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
    hostSetHosts: null
  };
  let hostSetHostsCount;

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
    }, 'withChildren');
    instances.hostSet = this.server.schema.hostSets.all().models[0];
    // Generate route URLs for resources
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.projects = `${urls.orgScope}/projects`;
    urls.project = `${urls.projects}/${instances.hostCatalog.scope.id}`;
    urls.hostCatalogs = `${urls.project}/host-catalogs`;
    urls.hostCatalog = `${urls.hostCatalogs}/${instances.hostCatalog.id}`;
    urls.hostSets = `${urls.hostCatalog}/host-sets`;
    urls.hostSet = `${urls.hostSets}/${instances.hostSet.id}`;
    urls.hostSetHosts = `${urls.hostSet}/hosts`;
    urls.addHosts = `${urls.hostSet}/add-hosts`;
    // Counts
    hostSetHostsCount = instances.hostSet.hosts.length;
  });

  test('visiting host set hosts', async function (assert) {
    assert.expect(2);
    await visit(urls.hostSetHosts);
    await a11yAudit();
    assert.equal(currentURL(), urls.hostSetHosts);
    assert.equal(findAll('tbody tr').length, hostSetHostsCount);
  });

  test('can remove a host', async function (assert) {
    assert.expect(2);
    await visit(urls.hostSetHosts);
    assert.equal(findAll('tbody tr').length, hostSetHostsCount);
    await click('tbody tr .rose-dropdown-button-danger');
    assert.equal(findAll('tbody tr').length, hostSetHostsCount - 1);
  });

  test('shows error message on host remove error', async function (assert) {
    assert.expect(2);
    this.server.post('/host-sets/:idMethod', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {},
        }
      );
    });
    await visit(urls.hostSetHosts);
    assert.equal(findAll('tbody tr').length, hostSetHostsCount);
    await click('tbody tr .rose-dropdown-button-danger');
    assert.ok(find('[role="alert"]'));
  });

  test('visiting add hosts', async function(assert) {
    assert.expect(1);
    await visit(urls.addHosts);
    await a11yAudit();
    assert.equal(currentURL(), urls.addHosts);
  });

  test('select and save hosts to add', async function (assert) {
    assert.expect(3);
    instances.hostSet.update({ hostIds: [] });
    await visit(urls.hostSetHosts);
    assert.equal(findAll('tbody tr').length, 0);
    await click('.rose-layout-page-actions a')
    assert.equal(currentURL(), urls.addHosts);
    // Click three times to select, unselect, then reselect (for coverage)
    await click('tbody label');
    await click('tbody label');
    await click('tbody label');
    await click('form [type="submit"]');
    await visit(urls.hostSetHosts);
    assert.equal(findAll('tbody tr').length, 1);
  });

  test('select and cancel hosts to add', async function (assert) {
    assert.expect(4);
    await visit(urls.hostSetHosts);
    assert.equal(findAll('tbody tr').length, hostSetHostsCount);
    await click('tbody tr .rose-dropdown-button-danger');
    assert.equal(findAll('tbody tr').length, hostSetHostsCount - 1);
    await click('.rose-layout-page-actions a')
    assert.equal(currentURL(), urls.addHosts);
    await click('tbody label');
    await click('form [type="button"]');
    await visit(urls.hostSetHosts);
    assert.equal(findAll('tbody tr').length, hostSetHostsCount - 1);
  });

  test('shows error message on host add error', async function (assert) {
    assert.expect(1);
    this.server.post('/host-sets/:idMethod', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {},
        }
      );
    });
    instances.hostSet.update({ hostIds: [] });
    await visit(urls.addHosts);
    await click('tbody label');
    await click('form [type="submit"]');
    assert.ok(find('[role="alert"]'));
  });
});
