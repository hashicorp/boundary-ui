/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as selectors from './selectors';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | host-catalogs | hosts | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupSqlite(hooks);

  const instances = {
    scopes: {
      global: null,
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
    hosts: null,
    host: null,
    unknownHost: null,
    newHost: null,
  };

  hooks.beforeEach(async function () {
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
    instances.host = this.server.create('host', {
      scope: instances.scopes.project,
      hostCatalog: instances.hostCatalog,
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.hostCatalogs = `${urls.projectScope}/host-catalogs`;
    urls.hostCatalog = `${urls.hostCatalogs}/${instances.hostCatalog.id}`;
    urls.hosts = `${urls.hostCatalog}/hosts`;
    urls.host = `${urls.hosts}/${instances.host.id}`;
    urls.unknownHost = `${urls.hosts}/foo`;
    urls.newHost = `${urls.hosts}/new`;
    await authenticateSession({});
  });

  test('Users can navigate to hosts with proper authorization', async function (assert) {
    await visit(urls.hostCatalog);

    assert.ok(
      instances.hostCatalog.authorized_collection_actions.hosts.includes(
        'list',
      ),
    );

    assert.dom(selectors.MANAGE_DROPDOWN_HOST_CATALOG).isVisible();
    assert.dom(commonSelectors.HREF(urls.hosts)).isVisible();
  });

  test('User cannot navigate to index without either list or create actions', async function (assert) {
    instances.hostCatalog.authorized_collection_actions.hosts = [];
    await visit(urls.hostCatalog);

    assert.notOk(
      instances.hostCatalog.authorized_collection_actions.hosts.includes(
        'list',
      ),
    );
    assert.dom(commonSelectors.HREF(urls.hosts)).doesNotExist();
  });

  test('User can navigate to index with only create action', async function (assert) {
    instances.hostCatalog.authorized_collection_actions.hosts = ['create'];
    await visit(urls.hostCatalog);

    assert.dom(commonSelectors.HREF(urls.hosts)).isVisible();
    await click(selectors.MANAGE_DROPDOWN_HOST_CATALOG);
    await click(selectors.MANAGE_DROPDOWN_HOST_CATALOG_NEW_HOST);
    assert.strictEqual(currentURL(), urls.newHost);
  });
});
