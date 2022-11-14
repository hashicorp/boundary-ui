import { module, test } from 'qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | host-catalogs | delete', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let gethostCatalogCount;

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    hostCatalog: null,
  };
  const urls = {
    globalScope: null,
    orgScope: null,
    projectScope: null,
    hostCatalogs: null,
    hostCatalog: null,
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
    // Generate resource couner
    gethostCatalogCount = () =>
      this.server.schema.hostCatalogs.all().models.length;
    authenticateSession({});
  });

  test('can delete host catalog', async function (assert) {
    assert.expect(1);
    const hostCatalogCount = gethostCatalogCount();

    await visit(urls.hostCatalogs);
    await click(`[href="${urls.hostCatalog}"]`);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');

    assert.strictEqual(gethostCatalogCount(), hostCatalogCount - 1);
  });

  test('cannot delete host catalog without proper authorization', async function (assert) {
    assert.expect(1);
    await visit(urls.hostCatalogs);
    instances.hostCatalog.authorized_actions =
      instances.hostCatalog.authorized_actions.filter(
        (item) => item !== 'delete'
      );

    await click(`[href="${urls.hostCatalog}"]`);

    assert
      .dom('.rose-layout-page-actions .rose-dropdown-button-danger')
      .doesNotExist();
  });

  test('can accept delete host catalog via dialog', async function (assert) {
    assert.expect(3);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    const hostCatalogCount = gethostCatalogCount();
    await visit(urls.hostCatalogs);

    await click(`[href="${urls.hostCatalog}"]`);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    await click('.rose-dialog .rose-button-primary');

    assert.dom('.rose-notification-body').hasText('Deleted successfully.');
    assert.strictEqual(gethostCatalogCount(), hostCatalogCount - 1);
    assert.strictEqual(currentURL(), urls.hostCatalogs);
  });

  test('can cancel delete host catalog via dialog', async function (assert) {
    assert.expect(2);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    const hostCatalogCount = gethostCatalogCount();
    await visit(urls.hostCatalogs);

    await click(`[href="${urls.hostCatalog}"]`);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    await click('.rose-dialog .rose-button-secondary');

    assert.strictEqual(gethostCatalogCount(), hostCatalogCount);
    assert.strictEqual(currentURL(), urls.hostCatalog);
  });

  test('deleting a host catalog which errors displays error messages', async function (assert) {
    assert.expect(1);
    await visit(urls.hostCatalogs);
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

    await click(`[href="${urls.hostCatalog}"]`);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');

    assert.dom('.rose-notification-body').hasText('Oops.');
  });
});
