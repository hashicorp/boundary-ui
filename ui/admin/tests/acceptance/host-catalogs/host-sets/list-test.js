/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | host-catalogs | host sets | list', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  const instances = {
    scopes: {
      org: null,
      project: null,
      hostCatalog: null,
      host: null,
    },
  };
  const urls = {
    globalScope: null,
    orgScope: null,
    projectScope: null,
    hostCatalogs: null,
    hostCatalog: null,
    hostSets: null,
    hostSet: null,
    newHostSet: null,
  };

  hooks.beforeEach(async function () {
    // Generate resources
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
    urls.newHostSet = `${urls.hostSets}/new`;
  });

  test('Users can navigate to host-sets with proper authorization', async function (assert) {
    await visit(urls.hostCatalog);

    assert.ok(
      instances.hostCatalog.authorized_collection_actions['host-sets'].includes(
        'list',
      ),
    );
    assert.dom(commonSelectors.HREF(urls.hostSets)).isVisible();
  });

  test('Users cannot navigate to index without either list or create actions', async function (assert) {
    instances.hostCatalog.authorized_collection_actions['host-sets'] = [];
    await visit(urls.hostCatalog);

    assert.notOk(
      instances.hostCatalog.authorized_collection_actions['host-sets'].includes(
        'list',
      ),
    );
    assert.dom(commonSelectors.HREF(urls.hostSets)).doesNotExist();
  });

  test('Users can navigate to index with only create action', async function (assert) {
    instances.hostCatalog.authorized_collection_actions['host-sets'] = [
      'create',
    ];
    await visit(urls.hostCatalog);

    assert.dom(commonSelectors.HREF(urls.hostSets)).isVisible();
  });
});
