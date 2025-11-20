/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import { setupMirage } from 'api/test-support/helpers/mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { TYPE_HOST_CATALOG_STATIC } from 'api/models/host-catalog';

module(
  'Unit | Controller | scopes/scope/host-catalogs/host-catalog/hosts/index',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);
    setupSqlite(hooks);

    let intl;
    let store;
    let controller;
    let getHostCount;

    const instances = {
      scopes: {
        org: null,
        project: null,
      },
      hostCatalog: null,
      host: null,
    };

    const urls = {
      hosts: null,
    };

    hooks.beforeEach(async function () {
      intl = this.owner.lookup('service:intl');
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/host-catalogs/host-catalog/hosts/index',
      );

      this.server.create('scope', { id: 'global' }, 'withGlobalAuth');
      await authenticateSession({
        isGlobal: true,
        account_id: this.server.schema.accounts.first().id,
      });
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
        type: TYPE_HOST_CATALOG_STATIC,
      });
      instances.host = this.server.create('host', {
        scopeId: instances.scopes.project.id,
        hostCatalog: instances.hostCatalog,
      });
      urls.globalScope = `/scopes/global`;
      urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
      urls.projectScope = `/scopes/${instances.scopes.project.id}`;
      urls.hosts = `${urls.projectScope}/host-catalogs/${instances.hostCatalog.id}/hosts`;

      getHostCount = () => this.server.schema.hosts.all().models.length;
    });

    test('it exists', function (assert) {
      assert.ok(controller);
      assert.ok(controller.hostCatalogs);
    });

    test('cancel action rolls-back changes on the specified model', async function (assert) {
      await visit(urls.hosts);
      const host = await store.findRecord('host', instances.host.id);
      host.name = 'test';

      assert.strictEqual(host.name, 'test');

      await controller.cancel(host);

      assert.notEqual(host.name, 'test');
    });

    test('save action saves changes on the specified model', async function (assert) {
      await visit(urls.hosts);
      const host = await store.findRecord('host', instances.host.id);
      host.name = 'test';

      await controller.save(host);

      assert.strictEqual(host.name, 'test');
    });

    test('delete action destroys specified model', async function (assert) {
      await visit(urls.projectScope);
      const host = await store.findRecord('host', instances.host.id);
      const hostCount = getHostCount();

      await controller.delete(host);

      assert.strictEqual(getHostCount(), hostCount - 1);
    });

    test('messageDescription returns correct translation with list authorization', async function (assert) {
      await visit(urls.hosts);

      assert.strictEqual(
        controller.messageDescription,
        intl.t('resources.host.description'),
      );
    });

    test('messageDescription returns correct translation with create authorization', async function (assert) {
      instances.hostCatalog.authorized_collection_actions.hosts = ['create'];
      await visit(urls.hosts);

      assert.strictEqual(
        controller.messageDescription,
        intl.t('descriptions.create-but-not-list', {
          resource: intl.t('resources.host.title_plural'),
        }),
      );
    });

    test('messageDescription returns correct translation with no authorization', async function (assert) {
      instances.hostCatalog.authorized_collection_actions.hosts = [];
      await visit(urls.hosts);

      assert.strictEqual(
        controller.messageDescription,
        intl.t('descriptions.neither-list-nor-create', {
          resource: intl.t('resources.host.title_plural'),
        }),
      );
    });
  },
);
