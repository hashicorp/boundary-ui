import { module, test } from 'qunit';
import { visit, currentURL, find, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | host-catalogs | create', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let gethostCatalogCount;

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    orgScope: null,
  };
  const urls = {
    globalScope: null,
    orgScope: null,
    projectScope: null,
    hostCatalogs: null,
    hostCatalog: null,
    newHostCatalog: null,
    newStaticHostCatalog: null,
    newDynamicHostCatalog: null,
  };

  hooks.beforeEach(function () {
    // Generate resources
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.orgScope = this.server.create(
      'scope',
      {
        type: 'org',
        scope: { id: 'global', type: 'global' },
      },
      'withChildren'
    );
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
    urls.orgScope = `/scopes/${instances.orgScope.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.hostCatalogs = `${urls.projectScope}/host-catalogs`;

    urls.hostCatalog = `${urls.hostCatalogs}/${instances.hostCatalog.id}`;
    urls.newHostCatalog = `${urls.hostCatalogs}/new`;
    urls.newStaticHostCatalog = `${urls.newHostCatalog}?type=static`;
    urls.newDynamicHostCatalog = `${urls.newHostCatalog}?type=aws`;
    // Generate resource couner
    gethostCatalogCount = () =>
      this.server.schema.hostCatalogs.all().models.length;

    authenticateSession({});
  });

  test('Users can create new static host catalogs', async function (assert) {
    assert.expect(1);
    const count = gethostCatalogCount();
    await visit(urls.newStaticHostCatalog);
    await fillIn('[name="name"]', 'random string');
    await fillIn('[name="description"]', 'random string');
    await fillIn('[name="types"]', 'static');
    await click('[type="submit"]');
    assert.equal(gethostCatalogCount(), count + 1);
  });

  test('Users can create new dynamic host catalogs', async function (assert) {
    assert.expect(1);
    const count = gethostCatalogCount();
    await visit(urls.newDynamicHostCatalog);
    await fillIn('[name="name"]', 'random string');
    await fillIn('[name="description"]', 'random string');
    await fillIn('[name="types"]', 'aws');
    await click('[type="submit"]');
    assert.equal(gethostCatalogCount(), count + 1);
  });

  test('Users can cancel creation of new static host catalogs', async function (assert) {
    assert.expect(2);
    const count = gethostCatalogCount();
    await visit(urls.newStaticHostCatalog);
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="button"]');
    assert.equal(currentURL(), urls.hostCatalogs);
    assert.equal(gethostCatalogCount(), count);
  });

  test('Users can cancel creation of new dynamic host catalogs', async function (assert) {
    assert.expect(2);
    const count = gethostCatalogCount();
    await visit(urls.newDynamicHostCatalog);
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="button"]');
    assert.equal(currentURL(), urls.hostCatalogs);
    assert.equal(gethostCatalogCount(), count);
  });

  test('Users can navigate to new static host catalogs route with proper authorization', async function (assert) {
    assert.expect(2);
    await visit(urls.hostCatalogs);
    assert.ok(
      instances.scopes.project.authorized_collection_actions[
        'host-catalogs'
      ].includes('create')
    );
    assert.ok(find(`[href="${urls.newHostCatalog}"]`));
  });

  test('Users cannot navigate to new static host catalogs route without proper authorization', async function (assert) {
    assert.expect(2);
    instances.scopes.project.authorized_collection_actions['host-catalogs'] =
      [];
    await visit(urls.hostCatalogs);
    assert.notOk(
      instances.scopes.project.authorized_collection_actions[
        'host-catalogs'
      ].includes('create')
    );
    assert.notOk(find(`[href="${urls.newStaticHostCatalog}"]`));
  });

  test('saving a new static host catalog with invalid fields displays error messages', async function (assert) {
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
    await visit(urls.newStaticHostCatalog);
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
});
