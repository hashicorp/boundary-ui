import { module, test } from 'qunit';
import { visit, currentURL, click, find, findAll, fillIn } from '@ember/test-helpers';
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

module('Acceptance | host-catalogs | host-sets | hosts', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let getHostSetHostCount;

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
      hostCatalog: null,
      host: null
    }
  };
  const urls = {
    globalScope: null,
    orgScope: null,
    projectScope: null,
    hostCatalogs: null,
    hostCatalog: null,
    hostSets: null,
    hostSet: null,
    hostSetHosts: null,
    addHosts: null,
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
    }, 'withChildren');
    instances.hostSet = this.server.schema.hostSets.all().models[0];
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.hostCatalogs = `${urls.projectScope}/host-catalogs`;
    urls.hostCatalog = `${urls.hostCatalogs}/${instances.hostCatalog.id}`;
    urls.hostSets = `${urls.hostCatalog}/host-sets`;
    urls.hostSet = `${urls.hostSets}/${instances.hostSet.id}`;
    urls.hostSetHosts = `${urls.hostSet}/hosts`;
    urls.addHosts = `${urls.hostSet}/add-hosts`;
    urls.createAndAddHost = `${urls.hostSet}/create-and-add-host`;
    // Generate resource couner
    getHostSetHostCount = () =>
      this.server.schema.hostSets.all().models[0].hosts.length;
    authenticateSession({});
  });

  test('visiting host set hosts', async function (assert) {
    assert.expect(2);
    await visit(urls.hostSetHosts);
    await a11yAudit();
    assert.equal(currentURL(), urls.hostSetHosts);
    assert.equal(findAll('tbody tr').length, getHostSetHostCount());
  });

  test('can remove a host', async function (assert) {
    assert.expect(2);
    const count = getHostSetHostCount();
    await visit(urls.hostSetHosts);
    assert.equal(findAll('tbody tr').length, count);
    await click('tbody tr .rose-dropdown-button-danger');
    assert.equal(findAll('tbody tr').length, count - 1);
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
    assert.equal(findAll('tbody tr').length, getHostSetHostCount());
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
    await click('.rose-layout-page-actions a:nth-child(2)')
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
    const count = getHostSetHostCount();
    await visit(urls.hostSetHosts);
    assert.equal(findAll('tbody tr').length, count);
    await click('tbody tr .rose-dropdown-button-danger');
    assert.equal(findAll('tbody tr').length, count - 1);
    await click('.rose-layout-page-actions a:nth-child(2)')
    assert.equal(currentURL(), urls.addHosts);
    await click('tbody label');
    await click('form [type="button"]');
    await visit(urls.hostSetHosts);
    assert.equal(findAll('tbody tr').length, count - 1);
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

  test('visiting host creation from a host set', async function (assert) {
    assert.expect(1);
    await visit(urls.createAndAddHost);
    await a11yAudit();
    assert.equal(currentURL(), urls.createAndAddHost);
  });

  test('create and add host to host set', async function (assert) {
    assert.expect(3);
    instances.hostSet.update({ hostIds: [] });
    await visit(urls.hostSet);
    assert.equal(findAll('tbody tr').length, 0);
    await click('.rose-layout-page-actions a:nth-child(1)')
    assert.equal(currentURL(), urls.createAndAddHost);
    await fillIn('[name="name"]', 'Test Name');
    await fillIn('[name="description"]', 'description');
    await click('form [type="submit"]:not(:disabled)');
    await visit(urls.hostSetHosts);
    assert.equal(findAll('tbody tr').length, 1);
  });

  test('create and cancel host add to host set', async function (assert) {
    assert.expect(1);
    await visit(urls.createAndAddHost);
    await click('form [type="button"]');
    assert.equal(currentURL(), urls.hostSetHosts);
  });

  test('shows error message on host creation error', async function (assert) {
    assert.expect(1);
    this.server.post('/hosts', () => {
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
    await visit(urls.createAndAddHost);
    await fillIn('[name="name"]', 'New Host');
    await click('form [type="submit"]');
    assert.ok(find('[role="alert"]'));
  });

  test('shows error message on host addition to host set error', async function (assert) {
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
    await visit(urls.createAndAddHost);
    await fillIn('[name="name"]', 'New Host');
    await click('form [type="submit"]');
    assert.ok(find('[role="alert"]'));
  });

});
