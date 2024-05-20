/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { authenticateSession } from 'ember-simple-auth/test-support';

module(
  'Unit | Controller | scopes/scope/host-catalogs/host-catalog/host-sets/index',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);
    setupIndexedDb(hooks);

    let store;
    let controller;
    let getHostSetCount;

    const instances = {
      scopes: {
        global: null,
        org: null,
        project: null,
      },
      hostCatalog: null,
      hostSet: null,
    };

    const urls = {
      hostSets: null,
    };

    hooks.beforeEach(function () {
      authenticateSession({});
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/host-catalogs/host-catalog/host-sets/index',
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
      instances.hostSet = this.server.create('host-set', {
        scopeId: instances.scopes.project.id,
        hostCatalog: instances.hostCatalog,
      });
      urls.globalScope = `/scopes/global`;
      urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
      urls.projectScope = `/scopes/${instances.scopes.project.id}`;
      urls.hostSets = `${urls.projectScope}/host-catalogs/${instances.hostCatalog.id}/host-sets`;

      getHostSetCount = () => this.server.schema.hostSets.all().models.length;
    });

    test('it exists', function (assert) {
      assert.ok(controller);
    });

    test('cancel action rolls-back changes on the specified model', async function (assert) {
      await visit(urls.hostSets);
      const hostSet = await store.findRecord('host-set', instances.hostSet.id);
      hostSet.name = 'test';

      assert.strictEqual(hostSet.name, 'test');

      await controller.cancel(hostSet);

      assert.notEqual(hostSet.name, 'test');
    });

    test('save action saves changes on the specified model', async function (assert) {
      await visit(urls.hostSets);
      const hostSet = await store.findRecord('host-set', instances.hostSet.id);
      hostSet.name = 'test';

      await controller.save(hostSet);

      assert.strictEqual(hostSet.name, 'test');
    });

    test('delete action destroys specified model', async function (assert) {
      await visit(urls.projectScope);
      const hostSet = await store.findRecord('host-set', instances.hostSet.id);
      const hostSetCount = getHostSetCount();

      await controller.delete(hostSet);

      assert.strictEqual(getHostSetCount(), hostSetCount - 1);
    });

    test('edit action updates to a dirty state', async function (assert) {
      const hostSet = await store.findRecord('host-set', instances.hostSet.id);

      assert.false(hostSet.hasDirtyAttributes);

      controller.edit(hostSet);

      assert.true(hostSet.hasDirtyAttributes);
    });

    test('removeHost action removes specified host from host-set', async function (assert) {
      await visit(urls.hostSets);
      const host = this.server.create('host', {
        scopeId: instances.scopes.project.id,
        hostCatalog: instances.hostCatalog,
      });
      const hostSet = await store.findRecord('host-set', instances.hostSet.id);
      await hostSet.addHost(host.id);

      assert.deepEqual(hostSet.host_ids, [host.id]);

      await controller.removeHost(hostSet, host);

      assert.deepEqual(hostSet.host_ids, []);
    });
  },
);
