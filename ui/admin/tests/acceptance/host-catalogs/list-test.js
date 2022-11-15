import { module, test } from 'qunit';
import { visit, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | host-catalogs | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

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
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.hostCatalogs = `${urls.projectScope}/host-catalogs`;
    urls.hostCatalog = `${urls.hostCatalogs}/${instances.hostCatalog.id}`;

    authenticateSession({});
  });

  test('user can navigate to host catalogs with proper authorization', async function (assert) {
    assert.expect(3);
    await visit(urls.orgScope);

    await click(`[href="${urls.projectScope}"]`);

    assert.true(
      instances.scopes.project.authorized_collection_actions[
        'host-catalogs'
      ].includes('list')
    );
    assert.true(
      instances.scopes.project.authorized_collection_actions[
        'host-catalogs'
      ].includes('create')
    );
    assert.dom(`[href="${urls.hostCatalogs}"]`).exists();
  });

  test('user cannot navigate to index without either list or create actions', async function (assert) {
    assert.expect(3);
    instances.scopes.project.authorized_collection_actions['host-catalogs'] =
      [];
    await visit(urls.orgScope);

    await click(`[href="${urls.projectScope}"]`);

    assert.false(
      instances.scopes.project.authorized_collection_actions[
        'host-catalogs'
      ].includes('list')
    );
    assert.false(
      instances.scopes.project.authorized_collection_actions[
        'host-catalogs'
      ].includes('create')
    );
    assert
      .dom(`nav:nth-child(2) a[href="${urls.hostCatalogs}"]`)
      .doesNotExist();
  });

  test('user can navigate to index with only create action', async function (assert) {
    assert.expect(4);
    instances.scopes.project.authorized_collection_actions['host-catalogs'] =
      instances.scopes.project.authorized_collection_actions[
        'host-catalogs'
      ].filter((item) => item !== 'list');
    await visit(urls.orgScope);

    await click(`[href="${urls.projectScope}"]`);

    assert.false(
      instances.scopes.project.authorized_collection_actions[
        'host-catalogs'
      ].includes('list')
    );
    assert.true(
      instances.scopes.project.authorized_collection_actions[
        'host-catalogs'
      ].includes('create')
    );
    assert.dom(`[href="${urls.hostCatalogs}"]`).exists();

    await click(`[href="${urls.hostCatalogs}"]`);

    assert.dom(`nav:nth-child(2) a[href="${urls.hostCatalog}"]`).doesNotExist();
  });

  test('user can navigate to index with only list action', async function (assert) {
    assert.expect(4);
    instances.scopes.project.authorized_collection_actions['host-catalogs'] =
      instances.scopes.project.authorized_collection_actions[
        'host-catalogs'
      ].filter((item) => item !== 'create');
    await visit(urls.orgScope);

    await click(`[href="${urls.projectScope}"]`);

    assert.false(
      instances.scopes.project.authorized_collection_actions[
        'host-catalogs'
      ].includes('create')
    );
    assert.true(
      instances.scopes.project.authorized_collection_actions[
        'host-catalogs'
      ].includes('list')
    );
    assert.dom(`[href="${urls.hostCatalogs}"]`).exists();

    await click(`[href="${urls.hostCatalogs}"]`);

    assert.dom(`[href="${urls.hostCatalog}"]`).exists();
  });
});
