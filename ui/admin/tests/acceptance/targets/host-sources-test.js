import { module, test } from 'qunit';
import { visit, currentURL, find, findAll, click } from '@ember/test-helpers';
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

module('Acceptance | targets | host-sources', function (hooks) {
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
    targets: null,
    target: null,
    targetHostSets: null,
    targetAddHostSets: null,
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
    instances.hostCatalog = this.server.create(
      'host-catalog',
      {
        scope: instances.scopes.project,
      },
      'withChildren'
    );
    instances.target = this.server.create('target', {
      scope: instances.scopes.project,
      hostSets: instances.hostCatalog.hostSets,
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.targets = `/scopes/${instances.scopes.project.id}/targets`;
    urls.target = `${urls.targets}/${instances.target.id}`;
    urls.targetHostSources = `${urls.target}/host-sources`;
    urls.targetAddHostSources = `${urls.target}/add-host-sources`;
    authenticateSession({});
  });

  test('visiting target host sources', async function (assert) {
    assert.expect(3);
    const targetHostSetCount = instances.target.hostSets.length;
    await visit(urls.targetHostSources);
    await a11yAudit();
    assert.equal(currentURL(), urls.targetHostSources);
    assert.ok(targetHostSetCount);
    assert.equal(findAll('tbody tr').length, targetHostSetCount);
  });

  test('can remove a host sets', async function (assert) {
    assert.expect(2);
    const targetHostSetCount = instances.target.hostSets.length;
    await visit(urls.targetHostSources);
    assert.equal(findAll('tbody tr').length, targetHostSetCount);
    await click('tbody tr .rose-dropdown-button-danger');
    assert.equal(findAll('tbody tr').length, targetHostSetCount - 1);
  });

  test('removing a target host set which errors displays error messages', async function (assert) {
    assert.expect(2);
    this.server.post('/targets/:idMethod', () => {
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
    const targetHostSetCount = instances.target.hostSets.length;
    await visit(urls.targetHostSources);
    assert.equal(findAll('tbody tr').length, targetHostSetCount);
    await click('tbody tr .rose-dropdown-button-danger');
    assert.ok(find('[role="alert"]'));
  });

  test('select and save host sets to add', async function (assert) {
    assert.expect(3);
    instances.target.update({ hostSetIds: [] });
    await visit(urls.targetHostSources);
    assert.equal(findAll('tbody tr').length, 0);
    await click('.rose-layout-page-actions a');
    assert.equal(currentURL(), urls.targetAddHostSources);
    // Click three times to select, unselect, then reselect (for coverage)
    await click('tbody label');
    await click('tbody label');
    await click('tbody label');
    await click('form [type="submit"]');
    await visit(urls.targetHostSources);
    assert.equal(findAll('tbody tr').length, 1);
  });

  test('select and cancel host sets to add', async function (assert) {
    assert.expect(4);
    const targetHostSetCount = instances.target.hostSets.length;
    await visit(urls.targetHostSources);
    assert.equal(findAll('tbody tr').length, targetHostSetCount);
    // first, remove a target host set (otherwise none would be available to add)
    await click('tbody tr .rose-dropdown-button-danger');
    assert.equal(findAll('tbody tr').length, targetHostSetCount - 1);
    await click('.rose-layout-page-actions a');
    assert.equal(currentURL(), urls.targetAddHostSources);
    await click('tbody label');
    await click('form [type="button"]');
    await visit(urls.targetHostSources);
    assert.equal(findAll('tbody tr').length, targetHostSetCount - 1);
  });

  test('adding a target host set which errors displays error messages', async function (assert) {
    assert.expect(4);
    this.server.post('/targets/:idMethod', () => {
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
    instances.target.update({ hostSetIds: [] });
    await visit(urls.targetAddHostSources);
    assert.equal(instances.target.hostSets.length, 0);
    assert.equal(currentURL(), urls.targetAddHostSources);
    await click('tbody label');
    await click('form [type="submit"]');
    assert.equal(currentURL(), urls.targetAddHostSources);
    assert.equal(instances.target.hostSets.length, 0);
  });
});
