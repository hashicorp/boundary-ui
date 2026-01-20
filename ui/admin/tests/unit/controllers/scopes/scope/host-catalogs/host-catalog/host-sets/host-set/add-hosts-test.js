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
  'Unit | Controller | scopes/scope/host-catalogs/host-catalog/host-sets/host-set/add-hosts',
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
      addHosts: null,
    };

    hooks.beforeEach(async function () {
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/host-catalogs/host-catalog/host-sets/host-set/add-hosts',
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
        scope: instances.scopes.project,
      });
      instances.hostSet = this.server.create('host-set', {
        scope: instances.scopes.project,
        hostCatalog: instances.hostCatalog,
      });
      instances.host = this.server.create('host', {
        scope: instances.scopes.project,
        hostCatalog: instances.hostCatalog,
      });

      urls.addHosts = `/scopes/${instances.scopes.project.id}/host-catalogs/${instances.hostCatalog.id}/host-sets/${instances.hostSet.id}/add-hosts`;
    });

    test('it exists', function (assert) {
      assert.ok(controller);
    });

    test('addHosts action adds selected hosts to the specified host-set', async function (assert) {
      await visit(urls.addHosts);
      const hostSet = await store.findRecord('host-set', instances.hostSet.id);

      assert.deepEqual(hostSet.host_ids, []);

      await controller.addHosts(hostSet, [instances.host.id]);

      assert.deepEqual(hostSet.host_ids, [instances.host.id]);
    });
  },
);
