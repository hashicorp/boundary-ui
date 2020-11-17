import { module, test } from 'qunit';
import { visit, currentURL, find, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import { resolve, reject } from 'rsvp';
import sinon from 'sinon';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | host-catalogs', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let gethostCatalogCount;

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
    // Generate resource couner
    gethostCatalogCount = () =>
      this.server.schema.hostCatalogs.all().models.length;
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

  test('visiting an unknown host catalog displays 404 message', async function (assert) {
    assert.expect(1);
    await visit(urls.unknownHostCatalog);
    await a11yAudit();
    assert.ok(find('.rose-message-subtitle').textContent.trim(), 'Error 404');
  });

  test('can create new host catalogs', async function (assert) {
    assert.expect(1);
    const count = gethostCatalogCount();
    await visit(urls.newHostCatalog);
    await fillIn('[name="name"]', 'random string');
    await click('[type="submit"]');
    assert.equal(gethostCatalogCount(), count + 1);
  });

  test('can cancel create new host catalogs', async function (assert) {
    assert.expect(2);
    const count = gethostCatalogCount();
    await visit(urls.newHostCatalog);
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="button"]');
    assert.equal(currentURL(), urls.hostCatalogs);
    assert.equal(gethostCatalogCount(), count);
  });

  test('saving a new host catalog with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.post('/host-catalogs', () => {
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
    await visit(urls.newHostCatalog);
    await click('[type="submit"]');
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'The request was invalid.'
    );
    assert.ok(
      find('.rose-form-error-message').textContent.trim(),
      'Name is required.'
    );
  });

  test('can save changes to existing host catalog', async function (assert) {
    assert.expect(3);
    assert.notEqual(instances.hostCatalog.name, 'random string');
    await visit(urls.hostCatalog);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="submit"]');
    assert.equal(currentURL(), urls.hostCatalog);
    assert.equal(
      this.server.schema.hostCatalogs.all().models[0].name,
      'random string'
    );
  });

  test('can cancel changes to existing host catalog', async function (assert) {
    assert.expect(2);
    await visit(urls.hostCatalog);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="button"]');
    assert.notEqual(instances.hostCatalog.name, 'random string');
    assert.equal(find('[name="name"]').value, instances.hostCatalog.name);
  });

  test('saving an existing host catalog with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.patch('/host-catalogs/:id', () => {
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
    await visit(urls.hostCatalog);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('[type="submit"]');
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'The request was invalid.'
    );
    assert.ok(
      find('.rose-form-error-message').textContent.trim(),
      'Name is required.'
    );
  });

  test('can discard unsaved host catalog changes via dialog', async function (assert) {
    assert.expect(5);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.hostCatalog.name, 'random string');
    await visit(urls.hostCatalog);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    assert.equal(currentURL(), urls.hostCatalog);
    try {
      await visit(urls.hostCatalogs);
    } catch (e) {
      assert.ok(find('.rose-dialog'));
      await click('.rose-dialog-footer button:first-child');
      assert.equal(currentURL(), urls.hostCatalogs);
      assert.notEqual(
        this.server.schema.hostCatalogs.all().models[0].name,
        'random string'
      );
    }
  });

  test('can cancel discard unsaved host catalog changes via dialog', async function (assert) {
    assert.expect(5);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.hostCatalog.name, 'random string');
    await visit(urls.hostCatalog);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    assert.equal(currentURL(), urls.hostCatalog);
    try {
      await visit(urls.hostCatalogs);
    } catch (e) {
      assert.ok(find('.rose-dialog'));
      await click('.rose-dialog-footer button:last-child');
      assert.equal(currentURL(), urls.hostCatalog);
      assert.notEqual(
        this.server.schema.hostCatalogs.all().models[0].name,
        'random string'
      );
    }
  });

  test('can delete host catalog', async function (assert) {
    assert.expect(1);
    const count = gethostCatalogCount();
    await visit(urls.hostCatalog);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.equal(gethostCatalogCount(), count - 1);
  });

  test('can accept delete host catalog via dialog', async function (assert) {
    assert.expect(2);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    confirmService.confirm = sinon.fake.returns(resolve());
    const count = gethostCatalogCount();
    await visit(urls.hostCatalog);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.equal(gethostCatalogCount(), count - 1);
    assert.ok(confirmService.confirm.calledOnce);
  });

  test('cannot cancel delete host catalog via dialog', async function (assert) {
    assert.expect(2);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    confirmService.confirm = sinon.fake.returns(reject());
    const count = gethostCatalogCount();
    await visit(urls.hostCatalog);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.equal(gethostCatalogCount(), count);
    assert.ok(confirmService.confirm.calledOnce);
  });

  test('deleting a host catalog which errors displays error messages', async function (assert) {
    assert.expect(1);
    this.server.del('/host-catalogs/:id', () => {
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
    await visit(urls.hostCatalog);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.ok(find('[role="alert"]').textContent.trim(), 'Oops.');
  });
});
