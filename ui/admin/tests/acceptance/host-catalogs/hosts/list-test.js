/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, find, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | host-catalogs | hosts | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const MANAGE_DROPDOWN_SELECTOR =
    '[data-test-manage-host-catalogs-dropdown] button:first-child';
  const NEW_HOST_SELECTOR =
    '[data-test-manage-host-catalogs-dropdown] div ul li a';

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
    assert.dom(MANAGE_DROPDOWN_SELECTOR);
    assert.ok(find(`[href="${urls.hosts}"]`));
  });

  test('User cannot navigate to index without either list or create actions', async function (assert) {
    instances.hostCatalog.authorized_collection_actions.hosts = [];
    await visit(urls.hostCatalog);
    assert.notOk(
      instances.hostCatalog.authorized_collection_actions.hosts.includes(
        'list',
      ),
    );
    assert.notOk(find(`[href="${urls.hosts}"]`));
  });

  test('User can navigate to index with only create action', async function (assert) {
    instances.hostCatalog.authorized_collection_actions.hosts = ['create'];
    await visit(urls.hostCatalog);
    assert.ok(find(`[href="${urls.hosts}"]`));
    await click(MANAGE_DROPDOWN_SELECTOR);
    assert.dom(NEW_HOST_SELECTOR).hasAttribute('href', urls.newHost);
  });
});
