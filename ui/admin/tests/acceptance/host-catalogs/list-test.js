import { module, test } from 'qunit';
import { visit, find } from '@ember/test-helpers';
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
    orgScope: null,
  };

  const urls = {
    scopes: {
      org: null,
    },
    projectScope: null,
    hostCatalogs: null,
  };

  hooks.beforeEach(function () {
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

    urls.hostCatalogs = `/scopes/${instances.orgScope.id}/host-catalogs`;
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.orgScope.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.hostCatalogs = `${urls.projectScope}/host-catalogs`;

    urls.hostCatalog = `${urls.hostCatalogs}/${instances.hostCatalog.id}`;
    authenticateSession({});
  });

  test('Users can navigate to host catalogs with proper authorization', async function (assert) {
    assert.expect(2);
    await visit(urls.projectScope);
    assert.ok(
      instances.scopes.project.authorized_collection_actions[
        'host-catalogs'
      ].includes('list')
    );
    assert.ok(find(`[href="${urls.hostCatalogs}"]`));
  });

  test('User cannot navigate to index without either list or create actions', async function (assert) {
    assert.expect(2);
    instances.scopes.project.authorized_collection_actions['host-catalogs'] =
      [];
    await visit(urls.projectScope);
    assert.notOk(
      instances.scopes.project.authorized_collection_actions[
        'host-catalogs'
      ].includes('list')
    );
    assert.notOk(find(`[href="${urls.hostCatalogs}"]`));
  });

  test('User can navigate to index with only create action', async function (assert) {
    assert.expect(1);
    instances.scopes.project.authorized_collection_actions['host-catalogs'] = [
      'create',
    ];
    await visit(urls.projectScope);
    assert.ok(find(`[href="${urls.hostCatalogs}"]`));
  });
});
