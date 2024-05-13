/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { waitUntil, visit } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { authenticateSession } from 'ember-simple-auth/test-support';

module(
  'Unit | Controller | scopes/scope/host-catalogs/index',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);
    setupIndexedDb(hooks);

    let store;
    let controller;
    let getHostCatalogCount;

    const instances = {
      scopes: {
        global: null,
        org: null,
        project: null,
      },
      hostCatalog: null,
    };

    const urls = {
      hostCatalogs: null,
    };

    hooks.beforeEach(function () {
      authenticateSession({});
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/host-catalogs/index',
      );

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
        scopeId: instances.scopes.project.id,
        scope: instances.scopes.project,
      });
      urls.globalScope = `/scopes/global`;
      urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
      urls.projectScope = `/scopes/${instances.scopes.project.id}`;
      urls.hostCatalogs = `${urls.projectScope}/host-catalogs`;

      getHostCatalogCount = () =>
        this.server.schema.hostCatalogs.all().models.length;
    });

    test('it exists', function (assert) {
      assert.ok(controller);
    });

    test('handleSearchInput action sets expected values correctly', async function (assert) {
      const searchValue = 'test';
      controller.handleSearchInput({ target: { value: searchValue } });
      await waitUntil(() => controller.search === searchValue);

      assert.strictEqual(controller.page, 1);
      assert.strictEqual(controller.search, searchValue);
    });

    test('cancel action rolls-back changes on the specified model', async function (assert) {
      await visit(urls.hostCatalogs);
      const hostCatalog = await store.findRecord(
        'host-catalog',
        instances.hostCatalog.id,
      );
      hostCatalog.name = 'test';

      assert.strictEqual(hostCatalog.name, 'test');

      await controller.cancel(hostCatalog);

      assert.notEqual(hostCatalog.name, 'test');
    });

    test('save action saves changes on the specified model', async function (assert) {
      await visit(urls.hostCatalogs);
      const hostCatalog = await store.findRecord(
        'host-catalog',
        instances.hostCatalog.id,
      );
      hostCatalog.name = 'test';

      await controller.save(hostCatalog);

      assert.strictEqual(hostCatalog.name, 'test');
    });

    test('delete action destroys specified model', async function (assert) {
      await visit(urls.projectScope);
      const hostCatalog = await store.findRecord(
        'host-catalog',
        instances.hostCatalog.id,
      );
      const hostCatalogCount = getHostCatalogCount();

      await controller.delete(hostCatalog);

      assert.strictEqual(getHostCatalogCount(), hostCatalogCount - 1);
    });
  },
);
