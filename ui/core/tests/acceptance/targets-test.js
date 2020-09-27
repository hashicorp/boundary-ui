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

module('Acceptance | targets', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    target: null,
    hostSets: null,
  };
  const urls = {
    orgScope: null,
    projects: null,
    project: null,
    targets: null,
    newTarget: null,
    target: null,
    targetHostSets: null,
    targetAddHostSets: null,
  };

  hooks.beforeEach(function () {
    // Setup Mirage mock resources for this test
    authenticateSession({});
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
      scope: instances.scopes.project
    }, 'withChildren');
    instances.target = this.server.create('target', {
      scope: instances.scopes.project,
      hostSets: instances.hostCatalog.hostSets
    });

    // Generate route URLs for resources
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.projects = `${urls.orgScope}/projects`;
    urls.project = `${urls.projects}/${instances.scopes.project.id}`;
    urls.targets = `${urls.project}/targets`;
    urls.newTarget = `${urls.targets}/new`;
    urls.target = `${urls.targets}/${instances.target.id}`;
    urls.targetHostSets = `${urls.target}/host-sets`;
    urls.targetAddHostSets = `${urls.target}/add-host-sets`;
  });

  hooks.afterEach(async function() {
    const notification = find('.rose-notification');
    if(notification) {
      await click('.rose-notification-dismiss');
    }
  });

  test('visiting targets', async function (assert) {
    assert.expect(1);
    await visit(urls.targets);
    await a11yAudit();
    assert.equal(currentURL(), urls.targets);
  });

  test('can navigate to a target form', async function (assert) {
    assert.expect(1);
    await visit(urls.targets);
    await click('main tbody .rose-table-header-cell:nth-child(1) a');
    await a11yAudit();
    assert.equal(currentURL(), urls.target);
  });

  test('can update a target and save changes', async function (assert) {
    assert.expect(2);
    await visit(urls.target);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'update name');
    await fillIn('[name="default_port"]', '1234');
    await click('form [type="submit"]:not(:disabled)');
    assert.equal(this.server.db.targets[0].name, 'update name');
    assert.equal(this.server.db.targets[0].attributes.default_port, '1234');
  });

  test('can update a target and cancel changes', async function (assert) {
    assert.expect(2);
    await visit(urls.target);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'update name');
    await fillIn('[name="default_port"]', '1234');
    await click('form button:not([type="submit"])');
    assert.notEqual(this.server.db.targets[0].name, 'update name');
    assert.notEqual(this.server.db.targets[0].port, '1234');
  });

  test('can create new target', async function (assert) {
    assert.expect(1);
    const targetsCount = this.server.db.targets.length;
    await visit(urls.newTarget);
    await fillIn('[name="name"]', 'Target name');
    await fillIn('[name="description"]', 'description');
    await fillIn('[name="default_port"]', '1234');
    await click('form [type="submit"]:not(:disabled)');
    assert.equal(this.server.db.targets.length, targetsCount + 1);
  });

  test('can cancel new target creation', async function (assert) {
    assert.expect(2);
    const targetsCount = this.server.db.targets.length;
    await visit(urls.newTarget);
    await fillIn('[name="name"]', 'Target Name');
    await click('form button:not([type="submit"])');
    assert.equal(this.server.db.targets.length, targetsCount);
    assert.equal(currentURL(), urls.targets);
  });

  test('can delete a target', async function(assert) {
    assert.expect(1);
    const targetsCount = this.server.db.targets.length;
    await visit(urls.target);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.equal(this.server.db.targets.length, targetsCount - 1);
  });

  test('saving a new target with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.post('/targets', () => {
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
    await visit(urls.newTarget);
    await fillIn('[name="name"]', 'new target');
    await click('form [type="submit"]');
    await a11yAudit();
    assert.ok(find('[role="alert"]'));
    assert.ok(find('.rose-form-error-message'));
  });

  test('errors are displayed when delete on a target fails', async function (assert) {
    assert.expect(1);
    this.server.del('/targets/:id', () => {
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
    await visit(urls.target);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    await a11yAudit();
    assert.ok(find('[role="alert"]'));
  });

  test('saving an existing target with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.patch('/targets/:id', () => {
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
    await visit(urls.target);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'existing target');
    await click('form [type="submit"]');
    await a11yAudit();
    assert.ok(find('[role="alert"]'));
    assert.ok(find('.rose-form-error-message'));
  });

  test('visiting target host sets', async function (assert) {
    assert.expect(3);
    const targetHostSetCount = instances.target.hostSets.length;
    await visit(urls.targetHostSets);
    await a11yAudit();
    assert.equal(currentURL(), urls.targetHostSets);
    assert.ok(targetHostSetCount);
    assert.equal(findAll('tbody tr').length, targetHostSetCount);
  });

  test('can remove a host sets', async function (assert) {
    assert.expect(2);
    const targetHostSetCount = instances.target.hostSets.length;
    await visit(urls.targetHostSets);
    assert.equal(findAll('tbody tr').length, targetHostSetCount);
    await click('tbody tr .rose-dropdown-button-danger');
    assert.equal(findAll('tbody tr').length, targetHostSetCount - 1);
  });

  test('shows error message on host set remove', async function (assert) {
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
    await visit(urls.targetHostSets);
    assert.equal(findAll('tbody tr').length, targetHostSetCount);
    await click('tbody tr .rose-dropdown-button-danger');
    assert.ok(find('[role="alert"]'));
  });

  test('select and save host sets to add', async function (assert) {
    assert.expect(3);
    instances.target.update({ hostSetIds: [] });
    await visit(urls.targetHostSets);
    assert.equal(findAll('tbody tr').length, 0);
    await click('.rose-layout-page-actions a')
    assert.equal(currentURL(), urls.targetAddHostSets);
    await click('tbody label');
    await click('form [type="submit"]');
    await visit(urls.targetHostSets);
    assert.equal(findAll('tbody tr').length, 1);
  });

  test('select and cancel host sets to add', async function (assert) {
    assert.expect(4);
    const targetHostSetCount = instances.target.hostSets.length;
    await visit(urls.targetHostSets);
    assert.equal(findAll('tbody tr').length, targetHostSetCount);
    // first, remove a target host set (otherwise none would be available to add)
    await click('tbody tr .rose-dropdown-button-danger');
    assert.equal(findAll('tbody tr').length, targetHostSetCount - 1);
    await click('.rose-layout-page-actions a')
    assert.equal(currentURL(), urls.targetAddHostSets);
    await click('tbody label');
    await click('form [type="button"]');
    await visit(urls.targetHostSets);
    assert.equal(findAll('tbody tr').length, targetHostSetCount - 1);
  });

  test('shows error message on host set add', async function (assert) {
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
    await visit(urls.targetAddHostSets);
    assert.equal(instances.target.hostSets.length, 0);
    assert.equal(currentURL(), urls.targetAddHostSets);
    await click('tbody label');
    await click('form [type="submit"]');
    assert.equal(currentURL(), urls.targetAddHostSets);
    assert.equal(instances.target.hostSets.length, 0);
  });
});
