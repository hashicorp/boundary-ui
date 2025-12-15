/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { authenticateSession } from 'ember-simple-auth/test-support';

module(
  'Unit | Controller | scopes/scope/host-catalogs/host-catalog/host-sets/host-set/create-and-add-host',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);
    setupSqlite(hooks);

    let store;
    let controller;

    const instances = {
      scopes: {
        org: null,
        project: null,
      },
      hostCatalog: null,
      hostSet: null,
      host: null,
    };

    const urls = {
      createAndAddHost: null,
    };

    hooks.beforeEach(async function () {
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/host-catalogs/host-catalog/host-sets/host-set/create-and-add-host',
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
      });
      instances.hostSet = this.server.create('host-set', {
        scopeId: instances.scopes.project.id,
        hostCatalog: instances.hostCatalog,
      });
      instances.host = this.server.create('host', {
        scopeId: instances.scopes.project.id,
        hostCatalog: instances.hostCatalog,
      });
      urls.globalScope = `/scopes/global`;
      urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
      urls.projectScope = `/scopes/${instances.scopes.project.id}`;
      urls.createAndAddHost = `${urls.projectScope}/host-catalogs/${instances.hostCatalog.id}/host-sets/${instances.hostSet.id}/create-and-add-host`;
    });

    test('it exists', function (assert) {
      assert.ok(controller);
    });

    test('cancel action rolls-back changes on the specified model', async function (assert) {
      await visit(urls.createAndAddHost);
      const host = await store.findRecord('host', instances.host.id);
      host.name = 'test';

      assert.strictEqual(host.name, 'test');

      await controller.cancel(host);

      assert.notEqual(host.name, 'test');
    });

    test('save action saves host and adds to the specified host-set', async function (assert) {
      await visit(urls.createAndAddHost);
      const hostSet = await store.findRecord('host-set', instances.hostSet.id);
      const host = await store.findRecord('host', instances.host.id);
      host.name = 'test';

      assert.deepEqual(hostSet.host_ids, []);

      await controller.save(host);

      assert.strictEqual(host.name, 'test');
      assert.deepEqual(hostSet.host_ids, [instances.host.id]);
    });
  },
);
